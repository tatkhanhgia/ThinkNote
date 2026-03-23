/**
 * POST /api/upload - Upload a single image for article editor
 * Returns { success: true, url: "/uploads/articles/YYYY/MM/hexname.ext" }
 * Requires authentication. Validates MIME type via magic bytes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { requireAuth } from '@/lib/auth-guard';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** Validate file magic bytes to confirm actual image format */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  switch (mimeType) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8;
    case 'image/png':
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    case 'image/gif':
      return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    case 'image/webp':
      return (
        buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
      );
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json(
      { success: false, error: 'Unsupported file type. Allowed: JPEG, PNG, GIF, WebP' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: 'File too large. Maximum 5MB' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validateMagicBytes(buffer, file.type)) {
    return NextResponse.json(
      { success: false, error: 'File content does not match declared type' },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const randomName = randomBytes(8).toString('hex');
    const ext = ALLOWED_TYPES[file.type];
    const relativePath = `uploads/articles/${year}/${month}/${randomName}${ext}`;
    const absolutePath = join(process.cwd(), 'public', relativePath);

    await mkdir(join(process.cwd(), 'public', 'uploads', 'articles', year, month), {
      recursive: true,
    });
    await writeFile(absolutePath, buffer);

    return NextResponse.json({ success: true, url: `/${relativePath}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}

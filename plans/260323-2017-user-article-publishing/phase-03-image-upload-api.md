# Phase 3: Image Upload API

## Context Links
- [Auth Guard Utils](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/lib/auth-guard.ts)
- [Existing .gitignore](C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/.gitignore)
- [Plan Overview](./plan.md)

## Overview
- **Priority**: P1
- **Status**: completed
- **Effort**: 2h
- **Depends on**: Phase 1
- Single image upload endpoint for article editor. Local storage in `public/uploads/articles/`

## Key Insights
- Next.js serves `public/` directory statically — uploaded images accessible at `/uploads/articles/...`
- Use FormData (multipart) for image upload, not base64
- Generate random filename to prevent overwrites and path guessing
- Organize by year/month to prevent single directory bloat
- TipTap image extension expects a URL back from upload

## Requirements

### Functional
- POST /api/upload: Accept single image file via FormData
- Supported formats: JPEG, PNG, GIF, WebP
- Max file size: 5MB
- Save to `public/uploads/articles/{YYYY}/{MM}/{randomId}.{ext}`
- Return JSON: `{ success: true, url: "/uploads/articles/2026/03/abc123.webp" }`
- Auth required (only logged-in users can upload)

### Non-Functional
- Validate MIME type by reading file magic bytes, not just extension
- Generate crypto-random filename (16 chars hex)
- Create year/month directories automatically

## Architecture

```
Client (TipTap) -[FormData]-> POST /api/upload -> validate -> save to disk -> return URL

Storage Path: public/uploads/articles/{YYYY}/{MM}/{randomHex16}.{ext}
URL Path: /uploads/articles/{YYYY}/{MM}/{randomHex16}.{ext}
```

## Related Code Files

### Files to Create
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/src/app/api/upload/route.ts`

### Files to Modify
- `C:/Users/Admin/Documents/Project/NetBeansProjects/MyProject/my-knowledge-base/.gitignore` - Add `public/uploads/`

## Implementation Steps

### Step 1: Add to .gitignore
```
# User uploads
public/uploads/
```

### Step 2: Create upload API route
```typescript
// src/app/api/upload/route.ts
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

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate type
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum 5MB' },
        { status: 400 }
      );
    }

    // Read file buffer + validate magic bytes
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { success: false, error: 'File content does not match declared type' },
        { status: 400 }
      );
    }

    // Generate path
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const randomName = randomBytes(8).toString('hex');
    const ext = ALLOWED_TYPES[file.type];
    const relativePath = `uploads/articles/${year}/${month}/${randomName}${ext}`;
    const absolutePath = join(process.cwd(), 'public', relativePath);

    // Ensure directory exists
    await mkdir(join(process.cwd(), 'public', 'uploads', 'articles', year, month), {
      recursive: true,
    });

    // Write file
    await writeFile(absolutePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/${relativePath}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  switch (mimeType) {
    case 'image/jpeg':
      return buffer[0] === 0xFF && buffer[1] === 0xD8;
    case 'image/png':
      return buffer[0] === 0x89 && buffer[1] === 0x50 &&
             buffer[2] === 0x4E && buffer[3] === 0x47;
    case 'image/gif':
      return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    case 'image/webp':
      return buffer.length >= 12 &&
             buffer[0] === 0x52 && buffer[1] === 0x49 &&
             buffer[2] === 0x46 && buffer[3] === 0x46 &&
             buffer[8] === 0x57 && buffer[9] === 0x45 &&
             buffer[10] === 0x42 && buffer[11] === 0x50;
    default:
      return false;
  }
}
```

### Step 3: Create uploads directory placeholder
```bash
mkdir -p public/uploads/articles
echo "*" > public/uploads/.gitignore
echo "!.gitignore" >> public/uploads/.gitignore
```

## Todo List
- [x] Add `public/uploads/` to .gitignore
- [x] Create `public/uploads/.gitignore` to keep directory in git
- [x] Create POST /api/upload route
- [x] Implement magic bytes validation
- [x] Test upload with each allowed format
- [x] Test rejection of oversized files
- [x] Test rejection of non-image files

## Success Criteria
- Upload JPEG/PNG/GIF/WebP under 5MB returns URL
- URL is publicly accessible at returned path
- Non-image or oversized files rejected with clear error
- Magic bytes validation catches misnamed files
- Unauthenticated requests return 401

## Risk Assessment
- **Low**: Disk space if abused — mitigate with per-user rate limit (future enhancement)
- **Low**: Path traversal via crafted filename — mitigated by generating random filename server-side
- **Medium**: No image optimization/resizing — acceptable for MVP, can add sharp later

## Security Considerations
- Auth required — prevents anonymous uploads
- MIME type validated via magic bytes, not just Content-Type header
- Random hex filename prevents guessing and overwriting
- Files stored outside `src/` — no code execution risk
- .gitignore prevents accidental commit of user uploads
- No path from user input in final file path (fully server-generated)

## Next Steps
- Phase 4: TipTap Editor (uses upload endpoint for image insertion)

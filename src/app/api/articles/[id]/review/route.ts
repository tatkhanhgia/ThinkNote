/**
 * POST /api/articles/[id]/review - Admin approves or rejects a PENDING article
 * Body: { action: 'approve' | 'reject', note?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
  }

  if (article.status !== 'PENDING') {
    return NextResponse.json(
      { success: false, error: 'Only PENDING articles can be reviewed' },
      { status: 400 }
    );
  }

  let body: { action?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, note } = body;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json(
      { success: false, error: 'action must be "approve" or "reject"' },
      { status: 400 }
    );
  }

  const now = new Date();
  const updated = await prisma.article.update({
    where: { id },
    data:
      action === 'approve'
        ? { status: 'PUBLISHED', publishedAt: now, reviewedAt: now, reviewedBy: session!.user.id, reviewNote: null }
        : { status: 'REJECTED', reviewNote: note ?? null, reviewedAt: now, reviewedBy: session!.user.id },
  });

  return NextResponse.json({ success: true, article: updated });
}

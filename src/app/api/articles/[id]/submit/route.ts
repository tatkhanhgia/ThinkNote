/**
 * POST /api/articles/[id]/submit - Author submits DRAFT article for review (DRAFT -> PENDING)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
  }

  if (article.authorId !== session!.user.id && session!.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  if (article.status !== 'DRAFT') {
    return NextResponse.json(
      { success: false, error: 'Only DRAFT articles can be submitted for review' },
      { status: 400 }
    );
  }

  if (!article.title.trim()) {
    return NextResponse.json({ success: false, error: 'Article must have a title' }, { status: 400 });
  }

  const updated = await prisma.article.update({
    where: { id },
    data: { status: 'PENDING' },
  });

  return NextResponse.json({ success: true, article: updated });
}

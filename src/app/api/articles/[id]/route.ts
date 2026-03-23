/**
 * GET    /api/articles/[id] - Get single article
 * PUT    /api/articles/[id] - Update article (author in DRAFT/REJECTED, or admin)
 * DELETE /api/articles/[id] - Delete article (author or admin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import { slugify } from '@/lib/slugify';

const MAX_CONTENT_BYTES = 100 * 1024;

type Params = { params: Promise<{ id: string }> };

/** Generate slug unique per locale, optionally excluding a given article ID */
async function generateUniqueSlug(title: string, locale: string, excludeId?: string) {
  const base = slugify(title) || 'article';
  let candidate = base;
  let suffix = 0;
  while (suffix <= 20) {
    const existing = await prisma.article.findUnique({
      where: { slug_locale: { slug: candidate, locale } },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix++;
    candidate = `${base}-${suffix}`;
  }
  throw new Error('Could not generate unique slug after 20 attempts');
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { session } = await requireAuth();
  const isAdmin = session?.user.role === 'admin';
  const userId = session?.user.id;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
  }

  // Non-published articles require owner or admin
  if (article.status !== 'PUBLISHED') {
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!isAdmin && article.authorId !== userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }
  }

  return NextResponse.json({ success: true, article });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
  }

  const isAdmin = session!.user.role === 'admin';
  const isOwner = article.authorId === session!.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  // Non-admin owners can only edit DRAFT or REJECTED articles
  if (!isAdmin && article.status !== 'DRAFT' && article.status !== 'REJECTED') {
    return NextResponse.json(
      { success: false, error: 'Cannot edit article in current status' },
      { status: 400 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const content = body.content as string | undefined;
  if (content !== undefined && Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
    return NextResponse.json({ success: false, error: 'Content exceeds 100KB limit' }, { status: 400 });
  }

  try {
    const newTitle = (body.title as string | undefined)?.trim();
    const locale = (body.locale as string | undefined) ?? article.locale;

    // Regenerate slug only if title changed
    let slug = article.slug;
    if (newTitle && newTitle !== article.title) {
      slug = await generateUniqueSlug(newTitle, locale, id);
    }

    const updateData: Record<string, unknown> = {};
    if (newTitle) updateData.title = newTitle;
    updateData.slug = slug;
    updateData.locale = locale;
    if (body.description !== undefined) updateData.description = (body.description as string).trim();
    if (content !== undefined) updateData.content = sanitizeArticleHtml(content);
    if (body.categories !== undefined) updateData.categories = body.categories as string[];
    if (body.tags !== undefined) updateData.tags = body.tags as string[];
    if (body.gradientFrom !== undefined) updateData.gradientFrom = body.gradientFrom as string | null;
    if (body.gradientTo !== undefined) updateData.gradientTo = body.gradientTo as string | null;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage as string | null;

    const updated = await prisma.article.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, article: updated });
  } catch (err) {
    console.error('Article update error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
  }

  const isAdmin = session!.user.role === 'admin';
  const isOwner = article.authorId === session!.user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Article delete error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete article' }, { status: 500 });
  }
}

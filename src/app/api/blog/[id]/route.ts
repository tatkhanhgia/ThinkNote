/**
 * GET    /api/blog/[id] - Get single blog post (admin only)
 * PUT    /api/blog/[id] - Update blog post (admin only)
 * DELETE /api/blog/[id] - Delete blog post (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import { generateUniqueSlug } from '@/lib/slug-utils';
import { calculateReadingTime } from '@/lib/blog-posts';

const MAX_CONTENT_BYTES = 100 * 1024;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const post = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  if (!post || post.type !== 'BLOG_POST') {
    return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, post });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const post = await prisma.article.findUnique({ where: { id } });
  if (!post || post.type !== 'BLOG_POST') {
    return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
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
    const locale = (body.locale as string | undefined) ?? post.locale;

    let slug = post.slug;
    if (newTitle && newTitle !== post.title) {
      slug = await generateUniqueSlug(newTitle, locale, id, 'blog-post');
    }

    const updateData: Record<string, unknown> = { slug, locale };
    if (newTitle) updateData.title = newTitle;
    if (body.description !== undefined) updateData.description = (body.description as string).trim();
    if (content !== undefined) {
      updateData.content = sanitizeArticleHtml(content);
      updateData.readingTime = calculateReadingTime(content.replace(/<[^>]*>/g, ''));
    }
    if (body.mood !== undefined) updateData.mood = body.mood as string | null;
    if (body.tags !== undefined) updateData.tags = body.tags as string[];
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage as string | null;

    if (body.status !== undefined) {
      const newStatus = body.status as string;
      updateData.status = newStatus;
      if (newStatus === 'PUBLISHED' && post.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.article.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    console.error('Blog update error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const post = await prisma.article.findUnique({ where: { id } });
  if (!post || post.type !== 'BLOG_POST') {
    return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
  }

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Blog delete error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete blog post' }, { status: 500 });
  }
}

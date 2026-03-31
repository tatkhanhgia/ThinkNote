/**
 * GET  /api/blog - List blog posts (admin: all statuses, public: published only)
 * POST /api/blog - Create blog post (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { generateUniqueSlug } from '@/lib/slug-utils';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import { calculateReadingTime } from '@/lib/blog-posts';
import type { ArticleStatus } from '@prisma/client';

const MAX_CONTENT_BYTES = 100 * 1024;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const VALID_LOCALES = ['en', 'vi'];

export async function GET(request: NextRequest) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as ArticleStatus | null;
  const locale = searchParams.get('locale');
  const mood = searchParams.get('mood');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)));
  const skip = (page - 1) * limit;

  // biome-ignore lint: dynamic where clause
  const where: Record<string, unknown> = { type: 'BLOG_POST' };
  if (status) where.status = status;
  if (locale) where.locale = locale;
  if (mood) where.mood = mood;

  try {
    const [posts, total] = await prisma.$transaction([
      prisma.article.findMany({
        where,
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Blog list error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const title = (body.title as string | undefined)?.trim();
  if (!title) {
    return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
  }

  const content = (body.content as string | undefined) ?? '';
  if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
    return NextResponse.json({ success: false, error: 'Content exceeds 100KB limit' }, { status: 400 });
  }

  const rawLocale = (body.locale as string | undefined) ?? 'en';
  const locale = VALID_LOCALES.includes(rawLocale) ? rawLocale : 'en';
  const status = (body.status as string) === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

  try {
    const slug = await generateUniqueSlug(title, locale, undefined, 'blog-post');
    const sanitizedContent = sanitizeArticleHtml(content);
    const readingTime = calculateReadingTime(content.replace(/<[^>]*>/g, ''));

    const post = await prisma.article.create({
      data: {
        title,
        slug,
        description: (body.description as string | undefined)?.trim() ?? '',
        content: sanitizedContent,
        locale,
        type: 'BLOG_POST',
        mood: (body.mood as string | undefined) ?? null,
        readingTime,
        tags: (body.tags as string[] | undefined) ?? [],
        coverImage: (body.coverImage as string | undefined) ?? null,
        status: status as ArticleStatus,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: session!.user.id,
      },
    });
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (err) {
    console.error('Blog create error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create blog post' }, { status: 500 });
  }
}

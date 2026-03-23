/**
 * POST /api/articles - Create article as DRAFT
 * GET  /api/articles - List articles with filters and pagination
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { slugify } from '@/lib/slugify';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import type { ArticleStatus } from '@prisma/client';

const MAX_CONTENT_BYTES = 100 * 1024; // 100KB
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/** Generate a slug unique per locale, appending suffix on collision */
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

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAuth();
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

  const locale = (body.locale as string | undefined) ?? 'en';

  try {
    const slug = await generateUniqueSlug(title, locale);
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        description: (body.description as string | undefined)?.trim() ?? '',
        content: sanitizeArticleHtml(content),
        locale,
        categories: (body.categories as string[] | undefined) ?? [],
        tags: (body.tags as string[] | undefined) ?? [],
        gradientFrom: (body.gradientFrom as string | undefined) ?? null,
        gradientTo: (body.gradientTo as string | undefined) ?? null,
        authorId: session!.user.id,
      },
    });
    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (err) {
    console.error('Article create error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create article' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { session } = await requireAuth();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status') as ArticleStatus | null;
  const authorId = searchParams.get('authorId');
  const locale = searchParams.get('locale');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)));
  const skip = (page - 1) * limit;

  const isAdmin = session?.user.role === 'admin';
  const userId = session?.user.id;

  // Build where clause based on permissions
  // biome-ignore lint: dynamic where clause requires flexible typing
  const where: Record<string, unknown> = {};

  if (isAdmin) {
    // Admin can filter by any status or author
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
  } else if (userId) {
    // Authenticated non-admin: can see own articles + all PUBLISHED
    if (authorId && authorId === userId) {
      // Requesting own articles — allow any status filter
      where.authorId = userId;
      if (status) where.status = status;
    } else {
      // Requesting others' articles or no author filter: only PUBLISHED
      where.status = 'PUBLISHED';
    }
  } else {
    // Unauthenticated: published only
    where.status = 'PUBLISHED';
  }

  if (locale) where.locale = locale;
  if (category) where.categories = { has: category };
  if (tag) where.tags = { has: tag };

  try {
    const [articles, total] = await prisma.$transaction([
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
      articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Article list error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch articles' }, { status: 500 });
  }
}


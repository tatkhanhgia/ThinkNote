/**
 * POST /api/blog/import - Import markdown file as blog post (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { generateUniqueSlug } from '@/lib/slug-utils';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import { calculateReadingTime } from '@/lib/blog-posts';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: { content: string; locale?: string; isBase64?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { locale = 'en', isBase64 = false } = body;
  let rawContent = body.content;

  if (!rawContent) {
    return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
  }

  if (isBase64) {
    try {
      rawContent = Buffer.from(rawContent, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to decode base64 content' }, { status: 400 });
    }
  }

  try {
    const { data: frontmatter, content: markdownBody } = matter(rawContent);

    const title = (frontmatter.title as string)?.trim();
    if (!title) {
      return NextResponse.json({ success: false, error: 'Markdown must have a title in frontmatter' }, { status: 400 });
    }

    const processed = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(markdownBody);
    const contentHtml = sanitizeArticleHtml(processed.toString());

    const rawDate = frontmatter.date;
    const dateStr = rawDate instanceof Date
      ? rawDate.toISOString()
      : rawDate ? new Date(String(rawDate)).toISOString() : new Date().toISOString();

    const slug = await generateUniqueSlug(title, locale, undefined, 'blog-post');

    const post = await prisma.article.create({
      data: {
        title,
        slug,
        description: (frontmatter.description as string)?.trim() ?? '',
        content: contentHtml,
        locale,
        type: 'BLOG_POST',
        mood: (frontmatter.mood as string) ?? null,
        readingTime: calculateReadingTime(markdownBody),
        tags: (frontmatter.tags as string[]) ?? [],
        coverImage: (frontmatter.coverImage as string) ?? null,
        status: 'PUBLISHED',
        publishedAt: new Date(dateStr),
        authorId: session!.user.id,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (err) {
    console.error('Blog import error:', err);
    return NextResponse.json({ success: false, error: 'Failed to import blog post' }, { status: 500 });
  }
}

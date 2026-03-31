/**
 * POST /api/blog/import - Import markdown file as blog post (admin only)
 * Supports optional `metadata` override for frontmatter-less markdown.
 * Auto-translates to the opposite locale (vi↔en).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { generateUniqueSlug } from '@/lib/slug-utils';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import { calculateReadingTime } from '@/lib/blog-posts';
import { extractBlogMetadata } from '@/lib/blog-import-utils';
import { TranslationService } from '@/lib/translation/TranslationService';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

interface ImportBody {
  content: string;
  locale?: string;
  isBase64?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    mood?: string;
    tags?: string[];
    coverImage?: string;
    date?: string;
    status?: 'DRAFT' | 'PUBLISHED';
  };
}

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  let body: ImportBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  let rawContent = body.content;
  if (!rawContent) {
    return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
  }

  if (body.isBase64) {
    try {
      rawContent = Buffer.from(rawContent, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to decode base64 content' }, { status: 400 });
    }
  }

  try {
    const extracted = extractBlogMetadata(rawContent);
    const meta = body.metadata;

    // Metadata override takes priority > frontmatter > auto-extracted
    const title = meta?.title?.trim() || extracted.title;
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required (provide in frontmatter, # heading, or metadata)' }, { status: 400 });
    }

    const description = meta?.description?.trim() ?? extracted.description;
    const mood = meta?.mood || extracted.mood || null;
    const tags = meta?.tags ?? extracted.tags;
    const coverImage = meta?.coverImage || extracted.coverImage || null;
    const locale = body.locale ?? 'en';
    const status = meta?.status ?? 'PUBLISHED';

    const dateStr = meta?.date
      ? new Date(meta.date).toISOString()
      : extracted.date ? new Date(extracted.date).toISOString() : new Date().toISOString();

    // Convert markdown body to HTML
    const processed = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(extracted.markdownBody);
    const contentHtml = sanitizeArticleHtml(processed.toString());

    const slug = await generateUniqueSlug(title, locale, undefined, 'blog-post');

    const post = await prisma.article.create({
      data: {
        title,
        slug,
        description,
        content: contentHtml,
        locale,
        type: 'BLOG_POST',
        mood,
        readingTime: calculateReadingTime(extracted.markdownBody),
        tags,
        coverImage,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date(dateStr) : null,
        authorId: session!.user.id,
      },
    });

    // Auto-translate to opposite locale (vi↔en)
    let translatedPost = null;
    const targetLocale = locale === 'vi' ? 'en' : 'vi';
    try {
      const [trTitle, trDesc, trBody] = await Promise.all([
        TranslationService.translate(title, locale, targetLocale),
        description ? TranslationService.translate(description, locale, targetLocale) : Promise.resolve(''),
        TranslationService.translate(extracted.markdownBody, locale, targetLocale),
      ]);

      const trProcessed = await remark()
        .use(remarkGfm)
        .use(html, { sanitize: false })
        .process(trBody);
      const trHtml = sanitizeArticleHtml(trProcessed.toString());
      const trSlug = await generateUniqueSlug(trTitle, targetLocale, undefined, 'blog-post');

      translatedPost = await prisma.article.create({
        data: {
          title: trTitle,
          slug: trSlug,
          description: trDesc,
          content: trHtml,
          locale: targetLocale,
          type: 'BLOG_POST',
          mood,
          readingTime: calculateReadingTime(trBody),
          tags,
          coverImage,
          status,
          publishedAt: status === 'PUBLISHED' ? new Date(dateStr) : null,
          authorId: session!.user.id,
        },
      });
    } catch (trErr) {
      console.error('Blog auto-translate error (non-blocking):', trErr);
    }

    return NextResponse.json({ success: true, post, translatedPost }, { status: 201 });
  } catch (err) {
    console.error('Blog import error:', err);
    return NextResponse.json({ success: false, error: 'Failed to import blog post' }, { status: 500 });
  }
}

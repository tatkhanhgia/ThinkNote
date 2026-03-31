/**
 * POST /api/blog/[id]/translate - Translate existing blog post to opposite locale (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { generateUniqueSlug } from '@/lib/slug-utils';
import { sanitizeArticleHtml } from '@/lib/article-sanitizer';
import { calculateReadingTime } from '@/lib/blog-posts';
import { TranslationService } from '@/lib/translation/TranslationService';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  const post = await prisma.article.findUnique({ where: { id } });
  if (!post || post.type !== 'BLOG_POST') {
    return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
  }

  const targetLocale = post.locale === 'vi' ? 'en' : 'vi';

  // Check if translation already exists
  const existing = await prisma.article.findFirst({
    where: { slug: post.slug, locale: targetLocale, type: 'BLOG_POST' },
  });
  if (existing) {
    return NextResponse.json({ success: false, error: `Translation already exists in ${targetLocale}` }, { status: 409 });
  }

  try {
    // Strip HTML to get plain text for translation
    const plainText = post.content.replace(/<[^>]*>/g, '');

    const [trTitle, trDesc, trContent] = await Promise.all([
      TranslationService.translate(post.title, post.locale, targetLocale),
      post.description
        ? TranslationService.translate(post.description, post.locale, targetLocale)
        : Promise.resolve(''),
      TranslationService.translate(plainText, post.locale, targetLocale),
    ]);

    // Convert translated plain text back to HTML via markdown
    const processed = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(trContent);
    const trHtml = sanitizeArticleHtml(processed.toString());
    const trSlug = await generateUniqueSlug(trTitle, targetLocale, undefined, 'blog-post');

    const translatedPost = await prisma.article.create({
      data: {
        title: trTitle,
        slug: trSlug,
        description: trDesc,
        content: trHtml,
        locale: targetLocale,
        type: 'BLOG_POST',
        mood: post.mood,
        readingTime: calculateReadingTime(trContent),
        tags: post.tags,
        coverImage: post.coverImage,
        status: post.status,
        publishedAt: post.publishedAt,
        authorId: session!.user.id,
      },
    });

    return NextResponse.json({ success: true, post: translatedPost }, { status: 201 });
  } catch (err) {
    console.error('Blog translate error:', err);
    return NextResponse.json({ success: false, error: 'Failed to translate blog post' }, { status: 500 });
  }
}

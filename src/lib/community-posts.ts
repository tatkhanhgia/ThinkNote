/**
 * Functions to fetch and merge community (DB-stored) articles with file-based posts.
 * Kept separate from posts.ts to limit file size growth.
 */
import { prisma } from './prisma';
import { getSortedPostsData, type PostData } from './posts';

/** Fetch all PUBLISHED community articles for a given locale */
export async function getPublishedArticles(locale: string): Promise<PostData[]> {
  const articles = await prisma.article.findMany({
    where: { locale, status: 'PUBLISHED', type: 'ARTICLE' },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { publishedAt: 'desc' },
  });

  return articles.map((a) => ({
    id: a.slug,
    articleId: a.id,
    title: a.title,
    description: a.description,
    date: (a.publishedAt ?? a.createdAt).toISOString().split('T')[0],
    tags: a.tags,
    categories: a.categories,
    gradientFrom: a.gradientFrom ?? undefined,
    gradientTo: a.gradientTo ?? undefined,
    contentHtml: a.content,
    source: 'community' as const,
    author: { name: a.author.name, image: a.author.image ?? undefined },
  }));
}

/** Merge file-based and DB community articles, sorted by date descending */
export async function getMergedPosts(locale: string): Promise<PostData[]> {
  const [filePosts, dbPosts] = await Promise.all([
    Promise.resolve(getSortedPostsData(locale).map((p) => ({ ...p, source: 'system' as const }))),
    getPublishedArticles(locale),
  ]);
  return [...filePosts, ...dbPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Get community posts matching a category slug */
export async function getCommunityPostsByCategorySlug(slug: string, locale: string): Promise<PostData[]> {
  const { slugify } = await import('./slugify');
  const articles = await prisma.article.findMany({
    where: { locale, status: 'PUBLISHED', type: 'ARTICLE' },
    include: { author: { select: { name: true, image: true } } },
  });

  return articles
    .filter((a) => a.categories.some((c) => slugify(c) === slug))
    .map((a) => ({
      id: a.slug,
      articleId: a.id,
      title: a.title,
      description: a.description,
      date: (a.publishedAt ?? a.createdAt).toISOString().split('T')[0],
      tags: a.tags,
      categories: a.categories,
      gradientFrom: a.gradientFrom ?? undefined,
      gradientTo: a.gradientTo ?? undefined,
      source: 'community' as const,
      author: { name: a.author.name, image: a.author.image ?? undefined },
    }));
}

/** Get community posts matching a tag string */
export async function getCommunityPostsByTag(tag: string, locale: string): Promise<PostData[]> {
  const articles = await prisma.article.findMany({
    where: { locale, status: 'PUBLISHED', type: 'ARTICLE', tags: { has: tag } },
    include: { author: { select: { name: true, image: true } } },
  });

  return articles.map((a) => ({
    id: a.slug,
    articleId: a.id,
    title: a.title,
    description: a.description,
    date: (a.publishedAt ?? a.createdAt).toISOString().split('T')[0],
    tags: a.tags,
    categories: a.categories,
    gradientFrom: a.gradientFrom ?? undefined,
    gradientTo: a.gradientTo ?? undefined,
    source: 'community' as const,
    author: { name: a.author.name, image: a.author.image ?? undefined },
  }));
}

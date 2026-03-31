import { prisma } from '@/lib/prisma';
export { BLOG_MOODS, type BlogMood } from './blog-moods';

export interface BlogPostData {
  id: string;
  title: string;
  description: string;
  date: string;
  mood: string;
  tags: string[];
  coverImage?: string;
  readingTime: number;
  contentHtml?: string;
}

/** Calculate reading time in minutes (200 wpm, min 1) */
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function toDateStr(d: Date | string | null): string {
  if (!d) return new Date().toISOString().split('T')[0];
  return d instanceof Date ? d.toISOString().split('T')[0] : new Date(d).toISOString().split('T')[0];
}

export async function getSortedBlogPosts(locale: string = 'en'): Promise<BlogPostData[]> {
  const posts = await prisma.article.findMany({
    where: { type: 'BLOG_POST', status: 'PUBLISHED', locale },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, description: true, mood: true,
      tags: true, coverImage: true, readingTime: true, publishedAt: true, createdAt: true,
    },
  });

  return posts.map((p) => ({
    id: p.slug,
    title: p.title,
    description: p.description,
    date: toDateStr(p.publishedAt ?? p.createdAt),
    mood: p.mood || 'reflective',
    tags: p.tags,
    coverImage: p.coverImage ?? undefined,
    readingTime: p.readingTime ?? 1,
  }));
}

export async function getBlogPostData(slug: string, locale: string = 'en'): Promise<BlogPostData | null> {
  const post = await prisma.article.findFirst({
    where: { slug, type: 'BLOG_POST', status: 'PUBLISHED', locale },
  });

  if (!post) return null;

  return {
    id: post.slug,
    title: post.title,
    description: post.description,
    date: toDateStr(post.publishedAt ?? post.createdAt),
    mood: post.mood || 'reflective',
    tags: post.tags,
    coverImage: post.coverImage ?? undefined,
    readingTime: post.readingTime ?? 1,
    contentHtml: post.content,
  };
}

export async function getBlogPostsByMood(mood: string, locale: string = 'en'): Promise<BlogPostData[]> {
  const posts = await prisma.article.findMany({
    where: { type: 'BLOG_POST', status: 'PUBLISHED', locale, mood },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, description: true, mood: true,
      tags: true, coverImage: true, readingTime: true, publishedAt: true, createdAt: true,
    },
  });

  return posts.map((p) => ({
    id: p.slug,
    title: p.title,
    description: p.description,
    date: toDateStr(p.publishedAt ?? p.createdAt),
    mood: p.mood || 'reflective',
    tags: p.tags,
    coverImage: p.coverImage ?? undefined,
    readingTime: p.readingTime ?? 1,
  }));
}

export async function getAllBlogMoods(locale: string = 'en'): Promise<{ mood: string; count: number }[]> {
  const groups = await prisma.article.groupBy({
    by: ['mood'],
    where: { type: 'BLOG_POST', status: 'PUBLISHED', locale, mood: { not: null } },
    _count: { mood: true },
    orderBy: { _count: { mood: 'desc' } },
  });

  return groups.map((g) => ({ mood: g.mood!, count: g._count.mood }));
}

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
export { BLOG_MOODS, type BlogMood } from './blog-moods';

const blogDirectory = path.join(process.cwd(), 'src/data/blog');

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

export function getSortedBlogPosts(locale: string = 'en'): BlogPostData[] {
  const dir = path.join(blogDirectory, locale);
  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(dir);
  } catch {
    return [];
  }

  const posts: BlogPostData[] = [];
  for (const fileName of fileNames.filter(f => f.endsWith('.md'))) {
    const id = fileName.replace(/\.md$/, '');
    const fullPath = path.join(dir, fileName);
    let raw = '';
    try {
      raw = fs.readFileSync(fullPath, 'utf8');
    } catch {
      continue;
    }
    const { data, content } = matter(raw);
    const rawDate = data.date;
    const dateStr = rawDate instanceof Date
      ? rawDate.toISOString().split('T')[0]
      : String(rawDate);
    posts.push({
      id,
      title: data.title as string,
      description: data.description as string,
      date: dateStr,
      mood: (data.mood as string) || 'reflective',
      tags: (data.tags as string[]) || [],
      coverImage: data.coverImage as string | undefined,
      readingTime: calculateReadingTime(content),
    });
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPostData(id: string, locale: string = 'en'): Promise<BlogPostData> {
  const fullPath = path.join(blogDirectory, locale, `${id}.md`);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  const processed = await remark()
    .use(html, { sanitize: false })
    .use(remarkGfm)
    .process(content);

  const rawDate = data.date;
  const dateStr = rawDate instanceof Date
    ? rawDate.toISOString().split('T')[0]
    : String(rawDate);

  return {
    id,
    title: data.title as string,
    description: data.description as string,
    date: dateStr,
    mood: (data.mood as string) || 'reflective',
    tags: (data.tags as string[]) || [],
    coverImage: data.coverImage as string | undefined,
    readingTime: calculateReadingTime(content),
    contentHtml: processed.toString(),
  };
}

export function getBlogPostsByMood(mood: string, locale: string = 'en'): BlogPostData[] {
  return getSortedBlogPosts(locale).filter(p => p.mood === mood);
}

export function getAllBlogMoods(locale: string = 'en'): { mood: string; count: number }[] {
  const posts = getSortedBlogPosts(locale);
  const counts: Record<string, number> = {};
  posts.forEach(p => {
    counts[p.mood] = (counts[p.mood] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);
}

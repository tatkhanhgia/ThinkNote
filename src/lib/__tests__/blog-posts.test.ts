import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma before importing blog-posts
vi.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { calculateReadingTime, getSortedBlogPosts, getAllBlogMoods, getBlogPostData } from '../blog-posts';
import { BLOG_MOODS } from '../blog-moods';
import { prisma } from '@/lib/prisma';

const mockArticle = (slug: string, date: string, mood = 'reflective') => ({
  id: `id-${slug}`,
  slug,
  title: `Post ${slug}`,
  description: `Desc ${slug}`,
  mood,
  tags: ['test'],
  coverImage: null,
  readingTime: 1,
  publishedAt: new Date(date),
  createdAt: new Date(date),
  content: '<p>Content</p>',
});

describe('calculateReadingTime', () => {
  it('returns 1 for very short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1);
  });

  it('returns 1 for empty string', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('calculates correctly for ~400 words', () => {
    const words = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('rounds to nearest minute', () => {
    const words = Array(500).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(3);
  });
});

describe('BLOG_MOODS', () => {
  it('contains all 8 expected moods', () => {
    const keys = Object.keys(BLOG_MOODS);
    expect(keys).toHaveLength(8);
    expect(keys).toContain('reflective');
    expect(keys).toContain('joyful');
    expect(keys).toContain('excited');
  });

  it('each mood has icon, en, and vi fields', () => {
    for (const [, data] of Object.entries(BLOG_MOODS)) {
      expect(data).toHaveProperty('icon');
      expect(data).toHaveProperty('en');
      expect(data).toHaveProperty('vi');
    }
  });
});

describe('getSortedBlogPosts', () => {
  beforeEach(() => {
    vi.mocked(prisma.article.findMany).mockReset();
  });

  it('returns posts mapped from DB results', async () => {
    vi.mocked(prisma.article.findMany).mockResolvedValue([
      mockArticle('post-b', '2026-03-01', 'inspired'),
      mockArticle('post-a', '2026-01-01', 'joyful'),
    ]);

    const posts = await getSortedBlogPosts('en');
    expect(posts).toHaveLength(2);
    expect(posts[0].id).toBe('post-b');
    expect(posts[0].mood).toBe('inspired');
    expect(posts[1].id).toBe('post-a');
  });

  it('returns empty array when no posts', async () => {
    vi.mocked(prisma.article.findMany).mockResolvedValue([]);
    const posts = await getSortedBlogPosts('en');
    expect(posts).toEqual([]);
  });

  it('includes readingTime in each post', async () => {
    vi.mocked(prisma.article.findMany).mockResolvedValue([mockArticle('a', '2026-01-01')]);
    const posts = await getSortedBlogPosts('en');
    posts.forEach(p => expect(p.readingTime).toBeGreaterThanOrEqual(1));
  });
});

describe('getBlogPostData', () => {
  beforeEach(() => {
    vi.mocked(prisma.article.findFirst).mockReset();
  });

  it('returns post with contentHtml when found', async () => {
    vi.mocked(prisma.article.findFirst).mockResolvedValue(mockArticle('my-post', '2026-02-15', 'grateful'));
    const post = await getBlogPostData('my-post', 'en');
    expect(post).not.toBeNull();
    expect(post!.id).toBe('my-post');
    expect(post!.contentHtml).toBe('<p>Content</p>');
    expect(post!.mood).toBe('grateful');
  });

  it('returns null when not found', async () => {
    vi.mocked(prisma.article.findFirst).mockResolvedValue(null);
    const post = await getBlogPostData('nonexistent', 'en');
    expect(post).toBeNull();
  });
});

describe('getAllBlogMoods', () => {
  it('returns mood counts sorted by count descending', async () => {
    vi.mocked(prisma.article.groupBy).mockResolvedValue([
      { mood: 'joyful', _count: { mood: 2 } },
      { mood: 'inspired', _count: { mood: 1 } },
    ] as any);

    const moods = await getAllBlogMoods('en');
    expect(moods[0]).toEqual({ mood: 'joyful', count: 2 });
    expect(moods[1]).toEqual({ mood: 'inspired', count: 1 });
  });

  it('returns empty array when no posts', async () => {
    vi.mocked(prisma.article.groupBy).mockResolvedValue([] as any);
    const moods = await getAllBlogMoods('en');
    expect(moods).toEqual([]);
  });
});

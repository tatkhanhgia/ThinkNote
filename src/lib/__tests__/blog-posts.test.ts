import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs before importing blog-posts (path is NOT mocked — use real path module)
vi.mock('fs', () => ({
  default: {
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}));

import { calculateReadingTime, getSortedBlogPosts, getAllBlogMoods } from '../blog-posts';
import { BLOG_MOODS } from '../blog-moods';
import fs from 'fs';

describe('calculateReadingTime', () => {
  it('returns 1 for very short content', () => {
    expect(calculateReadingTime('Hello world')).toBe(1);
  });

  it('returns 1 for empty string', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('calculates correctly for ~200 words', () => {
    const words = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words)).toBe(1);
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
    expect(keys).toContain('thoughtful');
    expect(keys).toContain('nostalgic');
    expect(keys).toContain('grateful');
    expect(keys).toContain('inspired');
    expect(keys).toContain('melancholic');
    expect(keys).toContain('excited');
  });

  it('each mood has icon, en, and vi fields', () => {
    for (const [, data] of Object.entries(BLOG_MOODS)) {
      expect(data).toHaveProperty('icon');
      expect(data).toHaveProperty('en');
      expect(data).toHaveProperty('vi');
      expect(data.icon.length).toBeGreaterThan(0);
      expect(data.en.length).toBeGreaterThan(0);
      expect(data.vi.length).toBeGreaterThan(0);
    }
  });
});

describe('getSortedBlogPosts', () => {
  const mockPost = (id: string, date: string, mood = 'reflective') =>
    `---\ntitle: Post ${id}\ndescription: Desc\ndate: ${date}\nmood: ${mood}\ntags: []\n---\nContent`;

  beforeEach(() => {
    vi.mocked(fs.readdirSync).mockReturnValue(['b.md', 'a.md'] as any);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (String(p).includes('a.md')) return mockPost('A', '2026-01-01', 'joyful');
      if (String(p).includes('b.md')) return mockPost('B', '2026-03-01', 'inspired');
      return '';
    });
  });

  it('returns posts sorted by date descending', () => {
    const posts = getSortedBlogPosts('en');
    expect(posts[0].date).toBe('2026-03-01');
    expect(posts[1].date).toBe('2026-01-01');
  });

  it('includes readingTime in each post', () => {
    const posts = getSortedBlogPosts('en');
    posts.forEach(p => expect(p.readingTime).toBeGreaterThanOrEqual(1));
  });

  it('returns empty array when directory read fails', () => {
    vi.mocked(fs.readdirSync).mockImplementation(() => { throw new Error('ENOENT'); });
    expect(getSortedBlogPosts('en')).toEqual([]);
  });

  it('skips files that fail to read', () => {
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (String(p).includes('a.md')) throw new Error('EACCES');
      return mockPost('B', '2026-03-01');
    });
    const posts = getSortedBlogPosts('en');
    expect(posts).toHaveLength(1);
  });
});

describe('getAllBlogMoods', () => {
  beforeEach(() => {
    vi.mocked(fs.readdirSync).mockReturnValue(['a.md', 'b.md', 'c.md'] as any);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (String(p).includes('a.md')) return `---\ntitle: A\ndescription: D\ndate: 2026-01-01\nmood: joyful\ntags: []\n---\nText`;
      if (String(p).includes('b.md')) return `---\ntitle: B\ndescription: D\ndate: 2026-02-01\nmood: joyful\ntags: []\n---\nText`;
      return `---\ntitle: C\ndescription: D\ndate: 2026-03-01\nmood: inspired\ntags: []\n---\nText`;
    });
  });

  it('returns mood counts sorted by count descending', () => {
    const moods = getAllBlogMoods('en');
    expect(moods[0]).toEqual({ mood: 'joyful', count: 2 });
    expect(moods[1]).toEqual({ mood: 'inspired', count: 1 });
  });

  it('returns empty array when no posts', () => {
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);
    expect(getAllBlogMoods('en')).toEqual([]);
  });
});

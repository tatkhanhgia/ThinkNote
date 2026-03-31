import matter from 'gray-matter';

export interface ExtractedBlogMeta {
  title: string;
  description: string;
  mood: string;
  tags: string[];
  date: string;
  coverImage: string;
  markdownBody: string;
}

/** Extract blog metadata from raw markdown (with or without frontmatter) */
export function extractBlogMetadata(raw: string): ExtractedBlogMeta {
  const { data: fm, content: body } = matter(raw);

  let title = (fm.title as string)?.trim() ?? '';
  let markdownBody = body;

  // Fallback: extract title from first # heading
  if (!title) {
    const match = markdownBody.match(/^#\s+(.+)$/m);
    if (match) {
      title = match[1].trim();
      // Remove the heading line from body to avoid duplication
      markdownBody = markdownBody.replace(/^#\s+.+$/m, '').trim();
    }
  }

  // Fallback: extract description from first non-empty paragraph
  let description = (fm.description as string)?.trim() ?? '';
  if (!description) {
    const lines = markdownBody.split('\n').filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('>')  && !l.startsWith('-') && !l.startsWith('|'));
    const firstPara = lines[0]?.replace(/[*_`[\]]/g, '').trim() ?? '';
    description = firstPara.slice(0, 200);
  }

  const rawDate = fm.date;
  const date = rawDate instanceof Date
    ? rawDate.toISOString().split('T')[0]
    : rawDate ? String(rawDate) : new Date().toISOString().split('T')[0];

  return {
    title,
    description,
    mood: (fm.mood as string) ?? '',
    tags: (fm.tags as string[]) ?? [],
    date,
    coverImage: (fm.coverImage as string) ?? '',
    markdownBody,
  };
}

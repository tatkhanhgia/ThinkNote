import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

/** Generate a slug unique per locale, appending suffix on collision */
export async function generateUniqueSlug(
  title: string,
  locale: string,
  excludeId?: string,
  fallback = 'article',
) {
  const base = slugify(title) || fallback;
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

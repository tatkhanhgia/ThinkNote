import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { slugify } from './slugify';
export { slugify } from './slugify';

const postsDirectory = path.join(process.cwd(), 'src/data');

export interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  gradientFrom?: string;
  gradientTo?: string;
  contentHtml?: string;
  /** 'system' = file-based, 'community' = user-submitted DB article */
  source?: 'system' | 'community';
  author?: { name: string; image?: string };
  articleId?: string; // DB article primary key for community articles
  [key: string]: any;
}

export function getSortedPostsData(locale: string = 'en'): PostData[] {
  const localePostsDirectory = path.join(postsDirectory, locale);
  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(localePostsDirectory);
  } catch (err) {
    console.error("Error reading posts directory:", localePostsDirectory, err);
    return []; 
  }

  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(localePostsDirectory, fileName);
      let fileContents = '';
      try {
        fileContents = fs.readFileSync(fullPath, 'utf8');
      } catch (err) {
        console.error("Error reading file:", fullPath, err);
        return null;
      }
      
      const matterResult = matter(fileContents);

      return {
        id,
        ...(matterResult.data as { 
          title: string; 
          description: string; 
          date: string; 
          tags: string[],
          categories: string[],
          gradientFrom?: string;
          gradientTo?: string;
        }),
      };
    })
    .filter(post => post !== null) as PostData[];

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostData(id: string, locale: string = 'en'): Promise<PostData> {
  const localePostsDirectory = path.join(postsDirectory, locale);
  const fullPath = path.join(localePostsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .use(remarkGfm)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...(matterResult.data as { 
      title: string; 
      description: string; 
      date: string; 
      tags: string[],
      categories: string[],
      gradientFrom?: string;
      gradientTo?: string;
    }),
  };
}

export function getAllPostIds(locales: string[]) {
  let paths: { params: { topic: string, locale: string } }[] = [];

  locales.forEach(locale => {
    const localePostsDirectory = path.join(postsDirectory, locale);
    if (fs.existsSync(localePostsDirectory)) {
      const fileNames = fs.readdirSync(localePostsDirectory);
      const localePaths = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
          return {
            params: {
              topic: fileName.replace(/\.md$/, ''),
              locale: locale,
            },
          };
        });
      paths = paths.concat(localePaths);
    }
  });

  return paths;
}

export function getAllTags(locale: string = 'en'): { [key: string]: number } {
  const allPosts = getSortedPostsData(locale);
  const tags: { [key: string]: number } = {};
  allPosts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        if (tags[tag]) {
          tags[tag]++;
        } else {
          tags[tag] = 1;
        }
      });
    }
  });
  return tags;
}

export function getPostsByTag(tag: string, locale: string = 'en'): PostData[] {
  const allPosts = getSortedPostsData(locale);
  return allPosts.filter(post => post.tags && post.tags.includes(tag));
}

export function getAllCategories(locale: string = 'en'): { [key: string]: number } {
  const allPosts = getSortedPostsData(locale);
  const categories: { [key: string]: number } = {};
  allPosts.forEach(post => {
    if (post.categories) {
      post.categories.forEach(category => {
        if (categories[category]) {
          categories[category]++;
        } else {
          categories[category] = 1;
        }
      });
    }
  });
  return categories;
}

export function getPostsByCategory(category: string, locale: string = 'en'): PostData[] {
  const allPosts = getSortedPostsData(locale);
  return allPosts.filter(post => post.categories && post.categories.includes(category));
}

// Maps English tag names to their locale translations
const tagTranslationMap: { [key: string]: { [key: string]: string } } = {
  "Machine Learning": { "vi": "Học Máy" },
  "Algorithms": { "vi": "Thuật Toán" },
  "Guide": { "vi": "Hướng dẫn" },
  "Database": { "vi": "Cơ Sở Dữ Liệu" },
  "Design": { "vi": "Thiết Kế" },
  "Optimization": { "vi": "Tối Ưu Hóa" },
  "Memory Management": { "vi": "Quản Lý Bộ Nhớ" },
  "Design Patterns": { "vi": "Mẫu Thiết Kế" },
  "Behavioral Patterns": { "vi": "Mẫu Hành Vi" },
  "Setup": { "vi": "Cài Đặt" },
  "Productivity": { "vi": "Năng Suất" },
  "Extensions": { "vi": "Tiện Ích" },
  "Shortcuts": { "vi": "Phím Tắt" },
};

// Reverse-map a locale tag back to its canonical English tag
function getCanonicalTag(localeTag: string, locale: string): string {
  if (locale === 'en') return localeTag;
  const englishTag = Object.keys(tagTranslationMap).find(
    key => tagTranslationMap[key][locale] === localeTag
  );
  return englishTag || localeTag;
}

// Count unique canonical (English) tags for a given locale
export function getUniqueTagCount(locale: string = 'en'): number {
  const allPosts = getSortedPostsData(locale);
  const canonicalTags = new Set(
    allPosts.flatMap(p => (p.tags || []).map(tag => getCanonicalTag(tag, locale)))
  );
  return canonicalTags.size;
}

const categoryTranslationMap: { [key: string]: { [key: string]: string } } = {
  // English to Vietnamese
  "Programming Languages": { "vi": "Ngôn ngữ lập trình" },
  "Development Core": { "vi": "Lõi phát triển" },
  "AI": { "vi": "Trí tuệ nhân tạo" },
  "Tool": { "vi": "Công cụ" },
  "Database": { "vi": "Cơ sở dữ liệu" },
  "Security": { "vi": "Bảo mật" },
  "Design Patterns": { "vi": "Mẫu thiết kế" },
  "Framework": { "vi": "Framework" },
  "Java": { "vi": "Java" },
  "Frontend": { "vi": "Frontend" },
  "Backend": { "vi": "Backend" },
  "IDE": { "vi": "IDE" },
  "System Design": { "vi": "Thiết kế hệ thống" },
  "Web Performance": { "vi": "Hiệu suất Web" },
};

// Function to get the translated category name
function getTranslatedCategory(englishCategory: string, locale: string): string {
  if (locale === 'en' || !categoryTranslationMap[englishCategory]) {
    return englishCategory;
  }
  return categoryTranslationMap[englishCategory][locale] || englishCategory;
}

export function getAllCategoriesWithSlug(locale: string = 'en') {
  const allEnPosts = getSortedPostsData('en');
  const allLocalePosts = getSortedPostsData(locale);
  const categories: { [key: string]: { name: string; count: number } } = {};

  // Use English posts to define the slugs
  allEnPosts.forEach(post => {
    post.categories?.forEach(category => {
      const slug = slugify(category);
      if (!categories[slug]) {
        categories[slug] = { name: getTranslatedCategory(category, locale), count: 0 };
      }
    });
  });

  // Count posts in the current locale
  allLocalePosts.forEach(post => {
    post.categories?.forEach(categoryNameInLocale => {
      // Find the corresponding English category to get the correct slug
      const englishCategory = Object.keys(categoryTranslationMap).find(key => 
        getTranslatedCategory(key, locale) === categoryNameInLocale
      ) || categoryNameInLocale;

      const slug = slugify(englishCategory);
      if (categories[slug]) {
        categories[slug].count++;
      }
    });
  });
  
  // Filter out categories with 0 posts in the current locale
  const filteredCategories = Object.entries(categories)
    .filter(([, data]) => data.count > 0)
    .map(([slug, data]) => ({
      slug,
      ...data,
    }));

  return filteredCategories;
}

export function getPostsByCategorySlug(slug: string, locale: string = 'en') {
  const allPosts = getSortedPostsData(locale);
  
  // Find the English category name from the slug
  const allEnPosts = getSortedPostsData('en');
  let englishCategory: string | null = null;
  for (const post of allEnPosts) {
    const foundCategory = post.categories?.find(cat => slugify(cat) === slug);
    if (foundCategory) {
      englishCategory = foundCategory;
      break;
    }
  }

  if (!englishCategory) {
    return [];
  }

  const translatedCategory = getTranslatedCategory(englishCategory, locale);

  return allPosts.filter(post =>
    post.categories?.includes(translatedCategory)
  );
}

export function getCategoryNameBySlug(slug: string, locale: string = 'en') {
  // Find the English category name from the slug by iterating through the canonical English categories
  const allEnPosts = getSortedPostsData('en');
  let englishCategory: string | null = null;

  for (const post of allEnPosts) {
    const foundCategory = post.categories?.find(cat => slugify(cat) === slug);
    if (foundCategory) {
      englishCategory = foundCategory;
      break;
    }
  }

  if (englishCategory) {
    return getTranslatedCategory(englishCategory, locale);
  }

  return null;
}

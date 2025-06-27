import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; 

const postsDirectory = path.join(process.cwd(), 'src/data');

export interface PostData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  gradientFrom?: string;
  gradientTo?: string;
  contentHtml?: string; // Sẽ dùng cho trang chi tiết
  [key: string]: any;
}

export function getSortedPostsData(): PostData[] {
  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (err) {
    console.error("Error reading posts directory:", postsDirectory, err);
    return []; 
  }

  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
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
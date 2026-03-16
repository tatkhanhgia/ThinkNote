const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'src/data');

function getSortedPostsData(locale = 'vi') {
  const localePostsDirectory = path.join(postsDirectory, locale);
  let fileNames = [];
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
      
      console.log(`File: ${fileName}`);
      console.log(`Title: ${matterResult.data.title}`);
      console.log(`Description: ${matterResult.data.description}`);
      console.log(`Description length: ${matterResult.data.description ? matterResult.data.description.length : 'undefined'}`);
      console.log('---');

      return {
        id,
        ...matterResult.data,
      };
    })
    .filter(post => post !== null);

  return allPostsData;
}

// Test the function
console.log('Testing posts data parsing...');
const posts = getSortedPostsData('vi');
console.log(`Total posts found: ${posts.length}`);
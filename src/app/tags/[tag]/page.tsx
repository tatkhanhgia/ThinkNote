import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import KnowledgeCard from '@/components/ui/KnowledgeCard';
import { Metadata } from 'next';

interface TagPageProps {
  params: {
    tag: string;
  };
}

// Function to generate metadata dynamically based on the tag
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = decodeURIComponent(params.tag);
  return {
    title: `Topics tagged with "${tagName}" - My Knowledge Base`,
    description: `Browse all programming topics tagged with "${tagName}".`,
  };
}

// Function to generate static paths for all tags (optional, for SSG)
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  const tags = new Set<string>();
  posts.forEach(post => {
    post.tags?.forEach(tag => tags.add(encodeURIComponent(tag.toLowerCase())));
  });
  return Array.from(tags).map(tag => ({ tag }));
}


export default function TagPage({ params }: TagPageProps) {
  const allPosts = getSortedPostsData();
  const tagName = decodeURIComponent(params.tag);

  const filteredPosts = allPosts.filter(post => 
    post.tags?.map(t => t.toLowerCase()).includes(tagName.toLowerCase())
  );

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          No topics found for tag: "{tagName}"
        </h1>
        <p className="text-lg text-white text-opacity-80 mb-6">
          Try exploring all topics or searching for something else.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/topics" className="bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-600 transition">
            All Topics
          </Link>
          <Link href="/" className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">
        Topics tagged with:
      </h1>
      <h2 className="text-2xl sm:text-3xl font-semibold text-purple-300 text-center mb-10">
        "{tagName}"
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <KnowledgeCard
            key={post.id}
            title={post.title}
            description={post.description}
            tags={post.tags}
            href={`/topics/${post.id}`} // Link to detailed page
            gradientFrom={post.gradientFrom || 'from-gray-700'}
            gradientTo={post.gradientTo || 'to-gray-800'}
          />
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import KnowledgeCard from '@/components/ui/KnowledgeCard';

export const metadata = {
  title: 'All Topics - My Knowledge Base',
  description: 'Browse all programming topics and articles.',
};

export default function TopicsPage() {
  const allPosts = getSortedPostsData();

  if (!allPosts || allPosts.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">No Topics Found</h1>
        <p className="text-lg text-slate-800 text-opacity-80">
          It seems there are no knowledge articles available at the moment.
        </p>
        <Link href="/" className="mt-6 inline-block bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-600 transition">
            Go back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 text-center mb-12">
        Explore All Topics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPosts.map((post) => (
          <KnowledgeCard
            key={post.id}
            title={post.title}
            description={post.description}
            tags={post.tags}
            href={`/topics/${post.id}`} // Link to detailed page (to be created)
            gradientFrom={post.gradientFrom || 'from-gray-700'} // Fallback gradient
            gradientTo={post.gradientTo || 'to-gray-800'}       // Fallback gradient
          />
        ))}
      </div>
    </div>
  );
}

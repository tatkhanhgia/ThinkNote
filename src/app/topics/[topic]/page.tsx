import { getPostData, getSortedPostsData } from '@/lib/posts';
import Head from 'next/head';
import Link from 'next/link';

export async function generateStaticParams() {
  const allPosts = getSortedPostsData();
  return allPosts.map((post) => ({
    topic: post.id,
  }));
}

export async function generateMetadata({ params }: { params: { topic: string } }) {
  const postData = await getPostData(params.topic);
  return {
    title: postData.title,
    description: postData.description,
  };
}

export default async function Post({ params }: { params: { topic: string } }) {
  const postData = await getPostData(params.topic);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article className="prose prose-invert lg:prose-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">{postData.title}</h1>
        <p className="text-gray-400 text-sm mb-6">{postData.date}</p>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} />
      </article>
      <div className="mt-8 text-center">
        <Link href="/topics" className="text-blue-400 hover:underline">
          ← Back to topics
        </Link>
      </div>
    </div>
  );
}

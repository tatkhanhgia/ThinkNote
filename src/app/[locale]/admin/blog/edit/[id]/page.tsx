import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BlogForm from '@/components/ui/blog-form';

type Props = { params: { locale: string; id: string } };

export default async function AdminBlogEditPage({ params: { locale, id } }: Props) {
  const post = await prisma.article.findUnique({ where: { id } });

  if (!post || post.type !== 'BLOG_POST') {
    notFound();
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Edit Blog Post</h2>
      <BlogForm
        locale={locale}
        initialData={{
          id: post.id,
          title: post.title,
          description: post.description,
          content: post.content,
          locale: post.locale,
          mood: post.mood ?? undefined,
          tags: post.tags,
          coverImage: post.coverImage ?? undefined,
          status: post.status,
        }}
      />
    </div>
  );
}

import BlogForm from '@/components/ui/blog-form';

type Props = { params: { locale: string } };

export default function AdminBlogCreatePage({ params: { locale } }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Create Blog Post</h2>
      <BlogForm locale={locale} />
    </div>
  );
}

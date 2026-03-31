import BlogImportWizard from '@/components/ui/blog-import-wizard';

type Props = { params: { locale: string } };

export default function AdminBlogImportPage({ params: { locale } }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Import Blog Post</h2>
      <BlogImportWizard locale={locale} />
    </div>
  );
}

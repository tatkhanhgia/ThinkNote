import AdminArticlesClient from '@/components/ui/admin-articles-client';

// Auth + admin role guard is handled by the parent /admin/layout.tsx
export default async function AdminArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Article Moderation</h2>
        <p className="mt-1 text-sm text-gray-500">Review and approve community articles</p>
      </div>
      <AdminArticlesClient locale={locale} />
    </div>
  );
}

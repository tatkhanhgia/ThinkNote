import AdminBlogClient from '@/components/ui/admin-blog-client';

type Props = { params: { locale: string } };

export default function AdminBlogPage({ params: { locale } }: Props) {
  return <AdminBlogClient locale={locale} />;
}

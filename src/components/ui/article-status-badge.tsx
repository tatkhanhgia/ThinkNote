/**
 * Reusable badge for article moderation status (DRAFT/PENDING/PUBLISHED/REJECTED).
 */
import type { ArticleStatus } from '@prisma/client';

const STATUS_STYLES: Record<ArticleStatus, string> = {
  DRAFT:     'bg-gray-100 text-gray-700',
  PENDING:   'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT:     'Draft',
  PENDING:   'Pending Review',
  PUBLISHED: 'Published',
  REJECTED:  'Rejected',
};

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

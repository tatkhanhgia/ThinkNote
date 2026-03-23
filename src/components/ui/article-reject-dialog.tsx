'use client';

/**
 * Modal dialog for admin to reject an article with an optional reason.
 */
interface ArticleRejectDialogProps {
  articleTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ArticleRejectDialog({ articleTitle, onConfirm, onCancel, loading }: ArticleRejectDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Reject Article</h2>
        <p className="text-sm text-gray-500 mb-4 truncate">&ldquo;{articleTitle}&rdquo;</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="reject-reason"
          rows={3}
          placeholder="Explain why this article is being rejected..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const reason = (document.getElementById('reject-reason') as HTMLTextAreaElement)?.value ?? '';
              onConfirm(reason);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Rejecting...' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

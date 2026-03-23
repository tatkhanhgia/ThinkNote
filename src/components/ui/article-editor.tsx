'use client';

/**
 * TipTap WYSIWYG editor for article creation/editing.
 * Handles image upload via drag-drop, paste, and toolbar button.
 * Must be dynamically imported with ssr:false in parent page.
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useEffect, useRef } from 'react';
import { ArticleEditorToolbar } from './article-editor-toolbar';

interface ArticleEditorProps {
  content?: string;
  placeholder?: string;
  onChange: (html: string) => void;
}

/** Upload image to /api/upload and return URL */
async function uploadImage(file: File): Promise<string | null> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.url : null;
}

export default function ArticleEditor({ content = '', placeholder = 'Start writing...', onChange }: ArticleEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg' } }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      // Handle paste of image files
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              uploadImage(file).then((url) => {
                if (url) view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: url })));
              });
              return true;
            }
          }
        }
        return false;
      },
      // Handle drop of image files
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file.type.startsWith('image/')) return false;
        event.preventDefault();
        uploadImage(file).then((url) => {
          if (url) {
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            const tr = view.state.tr.insert(pos ?? view.state.selection.anchor, view.state.schema.nodes.image.create({ src: url }));
            view.dispatch(tr);
          }
        });
        return true;
      },
    },
  });

  // Sync content prop if parent updates it (e.g. loading existing article)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleImageToolbarClick = () => fileInputRef.current?.click();

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const url = await uploadImage(file);
    if (url) editor.chain().focus().setImage({ src: url }).run();
    e.target.value = '';
  };

  if (!editor) return <div className="min-h-[400px] border border-gray-200 rounded-lg animate-pulse bg-gray-50" />;

  return (
    <div className="tiptap-editor border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-400">
      <ArticleEditorToolbar editor={editor} onImageUpload={handleImageToolbarClick} />
      <EditorContent editor={editor} className="prose max-w-none" />
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleFileInputChange} />
    </div>
  );
}

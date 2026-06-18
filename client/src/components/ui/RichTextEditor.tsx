// client/src/components/RichTextEditor.tsx
'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube'; // <-- NEW IMPORT
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link as LinkIcon, RemoveFormatting, Video } from 'lucide-react';
interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-xl shadow-sm my-6',
        },
      }),
    ],
    content: value || `<p>${placeholder || 'Write your story here...'}</p>`,
    immediatelyRender: false, // <--- ADD THIS LINE HERE
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[240px] p-4 text-gray-900 dark:text-gray-100',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // --- NEW YOUTUBE PROMPT FUNCTION ---
  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube Video URL:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 transition-all overflow-hidden">
      {/* ---------------- TOOLBAR ---------------- */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/20">
        
        <div className="flex items-center border-r border-gray-200 dark:border-white/10 pr-2 mr-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={<Heading2 className="w-4 h-4" />}
            title="Heading 2"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={<Heading3 className="w-4 h-4" />}
            title="Heading 3"
          />
        </div>

        <div className="flex items-center border-r border-gray-200 dark:border-white/10 pr-2 mr-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<Bold className="w-4 h-4" />}
            title="Bold"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<Italic className="w-4 h-4" />}
            title="Italic"
          />
          <ToolbarButton 
            onClick={setLink}
            isActive={editor.isActive('link')}
            icon={<LinkIcon className="w-4 h-4" />}
            title="Link"
          />
        </div>

        <div className="flex items-center border-r border-gray-200 dark:border-white/10 pr-2 mr-1">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<List className="w-4 h-4" />}
            title="Bullet List"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<ListOrdered className="w-4 h-4" />}
            title="Numbered List"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<Quote className="w-4 h-4" />}
            title="Quote"
          />
        </div>

        {/* --- NEW YOUTUBE BUTTON --- */}
        <div className="flex items-center border-r border-gray-200 dark:border-white/10 pr-2 mr-1">
          <ToolbarButton 
            onClick={addYoutubeVideo}
            isActive={editor.isActive('youtube')}
            icon={<Video className="w-4 h-4 text-red-600" />}
            title="Embed YouTube Video"
          />
        </div>

        <ToolbarButton 
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          isActive={false}
          icon={<RemoveFormatting className="w-4 h-4" />}
          title="Clear Formatting"
        />
      </div>

      {/* ---------------- EDITING CANVAS ---------------- */}
      <div className="cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .dark .ProseMirror p.is-editor-empty:first-child::before {
          color: #4b5563;
        }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror blockquote { border-left: 3px solid #dc2626; padding-left: 1rem; color: #4b5563; font-style: italic; margin-block: 1rem; }
        .dark .ProseMirror blockquote { color: #9ca3af; border-left-color: #ef4444; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        .dark .ProseMirror a { color: #60a5fa; }
        /* Ensures the iframe wrapper behaves well */
        .ProseMirror div[data-youtube-video] {
          cursor: default;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon, title }: { onClick: () => void, isActive: boolean, icon: React.ReactNode, title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 mx-0.5 rounded-lg transition-colors flex items-center justify-center ${
        isActive 
          ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
          : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}
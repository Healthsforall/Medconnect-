import React, { useState, useRef, useMemo } from 'react';
import { Send, X } from 'lucide-react';
import JoditEditor from 'jodit-react';
import { toast } from 'sonner';

export default function PostEditor({ onPostCreated }: { onPostCreated?: (content: string) => void }) {
  const [content, setContent] = useState('');
  const editor = useRef(null);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Share your products, updates, or thoughts with the global network...',
    height: 350,
    theme: 'default',
    toolbarAdaptive: false,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'video', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'fullsize'
    ],
    uploader: {
      insertImageAsBase64URI: true
    },
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    hidePoweredByJodit: true,
    image: {
      editSrc: false,
      editTitle: false,
      editAlt: true,
      editLink: false,
      editSize: true,
      editMargins: false,
      editClass: false,
      editStyle: false,
      editId: false,
      editAlign: true,
      showPreview: false,
      selectImageAfterClose: false,
    }
  }), []);

  const handleSubmit = () => {
    // Strip HTML tags to check if it's actually empty
    const plainText = content.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText && !content.includes('<img') && !content.includes('<video')) return;
    
    if (onPostCreated) {
      onPostCreated(content);
    } else {
      toast.success('Post published successfully!');
    }
    setContent('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-0">
        <JoditEditor
          ref={editor}
          value={content}
          config={config}
          tabIndex={1}
          onBlur={newContent => setContent(newContent)}
          onChange={newContent => setContent(newContent)}
        />
      </div>

      <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
        <span className="text-xs text-slate-500">
          Your post will be visible to your connections and in the global feed.
        </span>
        <button 
          onClick={handleSubmit}
          disabled={!content.replace(/<[^>]*>?/gm, '').trim() && !content.includes('<img') && !content.includes('<video')}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          Publish
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  RemoveFormatting,
  Code
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write product description with formatting...',
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value && !isUpdatingRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  return (
    <div className={`border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-zinc-50 border-b border-zinc-200 p-1.5 shrink-0">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-zinc-300 mx-1" />
        <button
          type="button"
          onClick={() => handleCommand('formatBlock', '<h1>')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('formatBlock', '<h2>')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-zinc-300 mx-1" />
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-zinc-300 mx-1" />
        <button
          type="button"
          onClick={() => handleCommand('justifyLeft')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyCenter')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyRight')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-zinc-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) handleCommand('createLink', url);
          }}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleCommand('removeFormat')}
          className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full min-h-[160px] max-h-[300px] overflow-y-auto p-3 text-xs sm:text-sm text-zinc-800 focus:outline-hidden prose prose-sm max-w-none"
        data-placeholder={placeholder}
      />
    </div>
  );
};

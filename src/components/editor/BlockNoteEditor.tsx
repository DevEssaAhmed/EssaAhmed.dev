import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { BlockNoteEditor, Block, PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './blocknote-theme.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { Skeleton } from '@/components/ui/skeleton';

export type BlockNoteContent = Block[];

interface BlockNoteEditorProps {
  initialContent?: BlockNoteContent | null;
  loading?: boolean;
  onChange: (value: BlockNoteContent) => void;
  onEditorReady?: (editor: BlockNoteEditor) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

// Upload files to Supabase Storage
async function uploadFile(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${timestamp}-${safeName}`;

  // Determine bucket based on file type
  let bucket = 'files';
  if (file.type.startsWith('image/')) {
    bucket = 'images';
  } else if (file.type.startsWith('video/')) {
    bucket = 'videos';
  }

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    console.error('Upload error:', error);
    toast.error(`Failed to upload ${file.name}`);
    throw error;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  toast.success('File uploaded successfully');
  return urlData.publicUrl;
}

// Parse inline formatting (bold, italic, code, links)
function parseInlineContent(text: string): any[] {
  if (!text) return [];

  const result: any[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Match bold **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)([^*_]+)\1/);
    if (boldMatch) {
      result.push({ type: 'text', text: boldMatch[2], styles: { bold: true } });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Match italic *text* or _text_ (single)
    const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      result.push({ type: 'text', text: italicMatch[2], styles: { italic: true } });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Match inline code `text`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      result.push({ type: 'text', text: codeMatch[1], styles: { code: true } });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Match links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      result.push({ type: 'link', content: [{ type: 'text', text: linkMatch[1], styles: {} }], href: linkMatch[2] });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/(\*\*|__|[*_`]|\[)/);
    if (nextSpecial === -1) {
      // No more special chars, add rest as plain text
      if (remaining) result.push({ type: 'text', text: remaining, styles: {} });
      break;
    } else if (nextSpecial === 0) {
      // Special char at start but no match - treat as plain text
      result.push({ type: 'text', text: remaining[0], styles: {} });
      remaining = remaining.slice(1);
    } else {
      // Add text before special char
      result.push({ type: 'text', text: remaining.slice(0, nextSpecial), styles: {} });
      remaining = remaining.slice(nextSpecial);
    }
  }

  return result.length > 0 ? result : [{ type: 'text', text: text, styles: {} }];
}

// Convert markdown to blocks with proper inline formatting
export function markdownToBlocks(markdown: string): PartialBlock[] {
  if (!markdown || !markdown.trim()) {
    return [{ type: 'paragraph', content: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: PartialBlock[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'codeBlock',
          props: { language: codeLanguage || 'plaintext' },
          content: codeContent.join('\n'),
        });
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Handle headings
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', props: { level: 3 }, content: parseInlineContent(line.slice(4)) });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', props: { level: 2 }, content: parseInlineContent(line.slice(3)) });
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', props: { level: 1 }, content: parseInlineContent(line.slice(2)) });
    }
    // Handle bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'bulletListItem', content: parseInlineContent(line.slice(2)) });
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'numberedListItem', content: parseInlineContent(line.replace(/^\d+\.\s/, '')) });
    }
    // Handle blockquotes - skip for now, BlockNote doesn't have native quote blocks
    else if (line.startsWith('> ')) {
      blocks.push({ type: 'paragraph', content: parseInlineContent(line.slice(2)) });
    }
    // Handle images
    else if (line.match(/^!\[.*?\]\((.+?)\)$/)) {
      const match = line.match(/^!\[.*?\]\((.+?)\)$/);
      if (match) {
        blocks.push({ type: 'image', props: { url: match[1] } });
      }
    }
    // Handle horizontal rules - skip
    else if (line === '---' || line === '***') {
      // BlockNote doesn't have HR, skip
    }
    // Handle paragraphs with inline formatting
    else if (line.trim()) {
      blocks.push({ type: 'paragraph', content: parseInlineContent(line) });
    }
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', content: '' }];
}

// Convert blocks to markdown
export async function blocksToMarkdown(editor: BlockNoteEditor): Promise<string> {
  try {
    return await editor.blocksToMarkdownLossy(editor.document);
  } catch (error) {
    console.error('Error converting to markdown:', error);
    return '';
  }
}

// Loading skeleton for editor, designed to closely mimic BlockNote's layout
const EditorSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex flex-col w-full py-6 space-y-4 ${className || ''}`}>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-9 w-3/4 rounded-md" />
    </div>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-5 w-full rounded-md" />
    </div>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-5 w-[85%] rounded-md" />
    </div>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-5 w-[90%] rounded-md" />
    </div>
    <div className="h-2"></div>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-6 w-1/3 rounded-md" />
    </div>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-5 w-[95%] rounded-md" />
    </div>
    <div className="flex items-center gap-3 pl-8 pr-4">
      <Skeleton className="h-5 w-[75%] rounded-md" />
    </div>
  </div>
);

const BlockNoteEditorComponent: React.FC<BlockNoteEditorProps> = ({
  initialContent,
  loading = false,
  onChange,
  onEditorReady,
  placeholder = "Type '/' for commands or start writing...",
  className = '',
  editable = true,
}) => {
  const { theme } = useTheme();
  const editorReadyRef = useRef(false);

  // Create editor only when we have content (or explicitly no content)
  // This follows BlockNote's uncontrolled component pattern
  const editor = useMemo(() => {
    // If loading, don't create editor yet
    if (loading) return null;

    // Determine initial content
    const content = initialContent && initialContent.length > 0
      ? initialContent
      : undefined;

    return BlockNoteEditor.create({
      initialContent: content,
      uploadFile,
    });
  }, [loading, initialContent]);

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady && !editorReadyRef.current) {
      editorReadyRef.current = true;
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Handle content changes
  const handleChange = useCallback(() => {
    if (!editor) return;
    const content = editor.document;
    onChange(content);
  }, [editor, onChange]);

  // Show loading state
  if (loading || !editor) {
    return <EditorSkeleton className={className} />;
  }

  return (
    <div className={`blocknote-editor-wrapper ${className}`} data-theme={theme}>
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        editable={editable}
        theme={theme}
        data-color-scheme={theme}
      />
    </div>
  );
};

export default BlockNoteEditorComponent;

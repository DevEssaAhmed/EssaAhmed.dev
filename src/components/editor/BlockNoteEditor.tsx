import React, { useCallback, useEffect } from 'react';
import { BlockNoteEditor, Block, PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './blocknote-theme.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

export type BlockNoteContent = Block[];

interface BlockNoteEditorProps {
  value?: BlockNoteContent;
  onChange: (value: BlockNoteContent) => void;
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

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
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

// Convert markdown to blocks (simple implementation)
export function markdownToBlocks(markdown: string): PartialBlock[] {
  if (!markdown || !markdown.trim()) {
    return [{ type: 'paragraph', content: '' }];
  }

  const lines = markdown.split('\n');
  const blocks: PartialBlock[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';

  for (const line of lines) {
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
      blocks.push({ type: 'heading', props: { level: 3 }, content: line.slice(4) });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', props: { level: 2 }, content: line.slice(3) });
    } else if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', props: { level: 1 }, content: line.slice(2) });
    }
    // Handle bullet lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'bulletListItem', content: line.slice(2) });
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'numberedListItem', content: line.replace(/^\d+\.\s/, '') });
    }
    // Handle blockquotes
    else if (line.startsWith('> ')) {
      blocks.push({ type: 'paragraph', content: line.slice(2) });
    }
    // Handle images
    else if (line.match(/^!\[.*?\]\((.+?)\)$/)) {
      const match = line.match(/^!\[.*?\]\((.+?)\)$/);
      if (match) {
        blocks.push({ type: 'image', props: { url: match[1] } });
      }
    }
    // Handle horizontal rules
    else if (line === '---' || line === '***') {
      // BlockNote doesn't have HR, skip or use paragraph
    }
    // Handle paragraphs
    else if (line.trim()) {
      blocks.push({ type: 'paragraph', content: line });
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

const BlockNoteEditorComponent: React.FC<BlockNoteEditorProps> = ({
  value,
  onChange,
  placeholder = "Type '/' for commands or start writing...",
  className = '',
  editable = true,
}) => {
  const { theme } = useTheme();
  
  // Create editor with upload handler
  const editor = useCreateBlockNote({
    uploadFile,
    initialContent: value && value.length > 0 ? value : undefined,
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (!editor || !value) return;

    // Compare current content with incoming value
    const currentContent = editor.document;
    const currentJSON = JSON.stringify(currentContent);
    const newJSON = JSON.stringify(value);

    // Only update if actually different and not empty
    if (currentJSON !== newJSON && value.length > 0) {
      try {
        editor.replaceBlocks(editor.document, value);
      } catch (e) {
        console.warn('Failed to replace blocks:', e);
      }
    }
  }, [editor, value]);

  // Handle content changes
  const handleChange = useCallback(() => {
    if (!editor) return;
    const content = editor.document;
    onChange(content);
  }, [editor, onChange]);

  return (
    <div className={`blocknote-editor-wrapper bg-transparent ${className}`} data-theme={theme}>
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


import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { SuggestionMenuController, getDefaultReactSlashMenuItems } from '@blocknote/react';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './blocknote-theme.css';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type BlockNoteContent,
  markdownToBlocks,
  blocksToMarkdown,
} from '@/lib/blocknote-markdown';

export type { BlockNoteContent };
export { markdownToBlocks, blocksToMarkdown };

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

// Error boundary to gracefully catch editor crashes
class EditorErrorBoundary extends React.Component<
  { children: React.ReactNode; className?: string },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode; className?: string }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('BlockNote editor error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`flex flex-col items-center justify-center p-8 border border-destructive/30 rounded-lg bg-destructive/5 ${this.props.className || ''}`}>
          <p className="text-sm font-medium text-destructive">Editor encountered an error</p>
          <p className="text-xs text-muted-foreground mt-1">{this.state.error}</p>
          <button
            className="mt-3 text-xs underline text-muted-foreground hover:text-foreground"
            onClick={() => this.setState({ hasError: false, error: '' })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // Create the editor exactly once when loading is done.
  // IMPORTANT: `initialContent` is intentionally excluded from deps — BlockNote
  // uses an uncontrolled pattern. Re-creating the editor on every content change
  // would destroy and reset the document on each keystroke.
   
  const editor = useMemo(() => {
    if (loading) return null;

    const content = initialContent && initialContent.length > 0 ? initialContent : undefined;

    return BlockNoteEditor.create({
      initialContent: content,
      uploadFile,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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
    onChange(editor.document);
  }, [editor, onChange]);

  // Show loading state
  if (loading || !editor) {
    return <EditorSkeleton className={className} />;
  }

  return (
    <EditorErrorBoundary className={className}>
      <div className={`blocknote-editor-wrapper ${className}`} data-theme={theme}>
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          editable={editable}
          theme={theme}
          data-color-scheme={theme}
          slashMenu={false}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query: string) => {
              const defaultItems = getDefaultReactSlashMenuItems(editor);
              // Filter items based on query
              if (!query) return defaultItems;
              const lowerQuery = query.toLowerCase();
              return defaultItems.filter(
                (item: DefaultReactSuggestionItem) =>
                  item.title.toLowerCase().includes(lowerQuery) ||
                  (item.subtext && item.subtext.toLowerCase().includes(lowerQuery)) ||
                  (item.aliases &&
                    item.aliases.some((alias: string) => alias.toLowerCase().includes(lowerQuery)))
              );
            }}
          />
        </BlockNoteView>
      </div>
    </EditorErrorBoundary>
  );
};

export default BlockNoteEditorComponent;

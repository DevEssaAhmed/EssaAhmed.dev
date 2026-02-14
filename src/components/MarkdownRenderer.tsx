"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Clipboard, Check } from 'lucide-react';
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const PreBlock = ({ children }: { children: any }) => {
  const codeRef = useRef<HTMLPreElement | null>(null);
  const [copied, setCopied] = useState(false);

  // children is usually a single <code> element produced by react-markdown
  const codeChild: any = Array.isArray(children) ? children[0] : children;
  const langMatch = typeof codeChild?.props?.className === 'string' ? codeChild.props.className.match(/language-([\w-]+)/) : null;
  const lang = (langMatch && langMatch[1]) ? langMatch[1] : 'text';

  const handleCopy = async () => {
    try {
      const text = codeRef.current?.innerText || '';
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch (e) {
      // swallow
    }
  };

  return (
    <div className="group relative my-6 rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <span className="text-[11px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">{lang}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre ref={codeRef} className="m-0 p-4 overflow-x-auto text-sm leading-relaxed">
        {codeChild}
      </pre>
    </div>
  );
};

const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-6 text-foreground" {...props} />,
          h2: ({ ...props }) => <h2 className="text-2xl font-semibold mb-5 text-foreground" {...props} />,
          h3: ({ ...props }) => <h3 className="text-xl font-semibold mb-4 text-foreground" {...props} />,
          h4: ({ ...props }) => <h4 className="text-lg font-semibold mb-3 text-foreground" {...props} />,
          h5: ({ ...props }) => <h5 className="text-base font-semibold mb-3 text-foreground" {...props} />,
          h6: ({ ...props }) => <h6 className="text-sm font-semibold mb-2 text-foreground" {...props} />,

          p: ({ ...props }) => <p className="mb-4 leading-relaxed text-foreground" {...props} />,

          a: ({ ...props }) => (
            <a
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          ul: ({ ...props }) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
          ol: ({ ...props }) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
          li: ({ ...props }) => <li className="text-foreground" {...props} />,

          // Inline code gets a subtle pill style
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[0.85em]" {...props}>
                  {children}
                </code>
              );
            }
            // For block code we delegate to PreBlock via the 'pre' renderer.
            // Return code as-is here; PreBlock will wrap it properly.
            return <code className={className} {...props}>{children}</code>;
          },

          // Modern pre with header + copy
          pre: ({ children }) => <PreBlock>{children}</PreBlock>,

          blockquote: ({ ...props }) => (
            <blockquote
              className="mb-4 pl-4 border-l-4 border-primary/30 bg-muted/30 p-4 rounded-r-lg italic text-muted-foreground"
              {...props}
            />
          ),

          table: ({ ...props }) => (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th className="px-4 py-3 bg-muted/50 border-b border-border text-left font-semibold text-foreground" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-3 border-b border-border text-foreground" {...props} />
          ),

          img: ({ ...props }) => (
            <OptimizedImage className="mb-6 rounded-lg max-w-full h-auto shadow-md" {...props} />
          ),

          hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;



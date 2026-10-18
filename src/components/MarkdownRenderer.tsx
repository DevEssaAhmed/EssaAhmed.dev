"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Clipboard, Check } from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const PreBlock = ({ children }: { children: any }) => {
  const codeRef = useRef<HTMLPreElement | null>(null);
  const [copied, setCopied] = useState(false);

  const codeChild: any = Array.isArray(children) ? children[0] : children;
  const langMatch =
    typeof codeChild?.props?.className === "string"
      ? codeChild.props.className.match(/language-([\w-]+)/)
      : null;
  const lang = langMatch && langMatch[1] ? langMatch[1] : "text";

  const handleCopy = async () => {
    try {
      const text = codeRef.current?.innerText || "";
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="group relative my-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-outline-variant/20 bg-surface-container-low">
        <span className="text-[11px] font-code tracking-wider uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-secondary" />
          ) : (
            <Clipboard className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre
        ref={codeRef}
        className="m-0 p-4 overflow-x-auto text-sm leading-relaxed font-code"
      >
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
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          h1: ({ node: _node, ...props }: any) => (
            <h1
              className="text-2xl sm:text-3xl font-display font-bold mt-8 mb-4 text-on-surface tracking-tight"
              {...props}
            />
          ),
          h2: ({ node: _node, ...props }: any) => (
            <h2
              className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4 pb-2 border-b border-outline-variant/20 text-on-surface tracking-tight"
              {...props}
            />
          ),
          h3: ({ node: _node, ...props }: any) => (
            <h3
              className="text-lg sm:text-xl font-display font-semibold mt-6 mb-3 text-on-surface"
              {...props}
            />
          ),
          h4: ({ node: _node, ...props }: any) => (
            <h4
              className="text-base sm:text-lg font-display font-semibold mt-4 mb-2 text-on-surface"
              {...props}
            />
          ),
          h5: ({ node: _node, ...props }: any) => (
            <h5
              className="text-base font-semibold mt-4 mb-2 text-on-surface"
              {...props}
            />
          ),
          h6: ({ node: _node, ...props }: any) => (
            <h6
              className="text-sm font-semibold mt-3 mb-2 text-on-surface-variant"
              {...props}
            />
          ),

          p: ({ node, children, ...props }: any) => {
            if (node?.children?.length === 1 && node.children[0].type === "text") {
              const text = node.children[0].value;
              const match = text.match(/^!video\[.*?\]\((.+?)\)$/);
              if (match) {
                const url = match[1];
                const isYoutube =
                  url.includes("youtube") || url.includes("youtu.be");
                const isVimeo = url.includes("vimeo");

                return (
                  <div className="my-8 rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm max-w-4xl mx-auto">
                    <div className="aspect-video bg-surface-container-lowest">
                      {isYoutube ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${
                            url.includes("watch?v=")
                              ? url.split("watch?v=")[1]?.split("&")[0]
                              : url.split("/").pop()
                          }`}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : isVimeo ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${url
                            .split("/")
                            .pop()}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={url} controls className="w-full h-full" />
                      )}
                    </div>
                  </div>
                );
              }
            }
            return (
              <p
                className="mb-4 leading-relaxed text-on-surface-variant font-body-lg text-base"
                {...props}
              >
                {children}
              </p>
            );
          },

          a: ({ node: _node, ...props }: any) => (
            <a
              className="text-primary hover:underline underline-offset-2 transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          ul: ({ node: _node, ...props }: any) => (
            <ul
              className="mb-4 ml-6 list-disc space-y-2 text-on-surface-variant"
              {...props}
            />
          ),
          ol: ({ node: _node, ...props }: any) => (
            <ol
              className="mb-4 ml-6 list-decimal space-y-2 text-on-surface-variant"
              {...props}
            />
          ),
          li: ({ node: _node, ...props }: any) => (
            <li className="text-on-surface-variant leading-relaxed" {...props} />
          ),

          code: ({ node: _node, inline, className: codeClass, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-surface-container border border-outline-variant/25 text-primary font-code text-[0.85em]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={codeClass} {...props}>
                {children}
              </code>
            );
          },

          pre: ({ children }: any) => <PreBlock>{children}</PreBlock>,

          blockquote: ({ node: _node, ...props }: any) => (
            <blockquote
              className="my-5 pl-4 border-l-4 border-secondary bg-surface-container-low p-4 rounded-r-xl italic text-on-surface"
              {...props}
            />
          ),

          table: ({ node: _node, ...props }: any) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-outline-variant/30">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ node: _node, ...props }: any) => (
            <th
              className="px-4 py-3 bg-surface-container border-b border-outline-variant/30 text-left font-semibold text-on-surface text-sm"
              {...props}
            />
          ),
          td: ({ node: _node, ...props }: any) => (
            <td
              className="px-4 py-3 border-b border-outline-variant/20 text-on-surface-variant text-sm"
              {...props}
            />
          ),

          img: ({ node: _node, src, alt }: any) => {
            if (!src) return null;
            return (
              <span className="block my-6 rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container-lowest shadow-lg">
                <img
                  src={src}
                  alt={alt || "Project visual"}
                  className="w-full h-auto object-contain max-h-[640px] mx-auto"
                  loading="lazy"
                />
              </span>
            );
          },

          hr: ({ node: _node, ...props }: any) => (
            <hr className="my-8 border-outline-variant/25" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

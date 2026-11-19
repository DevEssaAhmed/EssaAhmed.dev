import { CodePreBlock } from "@/components/markdown/CodePreBlock";
import { OptimizedImage } from "@/components/OptimizedImage";
import { parseSafeVideoUrl } from "@/lib/video-embed";

function extractCodeLanguage(node: any, children: any): string {
  const codeChild = Array.isArray(children) ? children[0] : children;
  if (typeof codeChild?.props?.className === "string") {
    const match = codeChild.props.className.match(/language-([\w-]+)/);
    if (match?.[1]) return match[1];
  }

  const hastClasses = node?.children?.[0]?.properties?.className;
  if (Array.isArray(hastClasses)) {
    for (const cls of hastClasses) {
      if (typeof cls === "string") {
        const match = cls.match(/language-([\w-]+)/);
        if (match?.[1]) return match[1];
      }
    }
  } else if (typeof hastClasses === "string") {
    const match = hastClasses.match(/language-([\w-]+)/);
    if (match?.[1]) return match[1];
  }

  return "text";
}

export function createMarkdownComponents() {
  return {
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
        const match = text.match(/^!video\[(.*?)\]\((.+?)\)$/);
        if (match) {
          const videoTitle = match[1]?.trim() || "Embedded video walkthrough";
          const video = parseSafeVideoUrl(match[2]);
          if (video) {
            return (
              <div className="my-8 rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm max-w-4xl mx-auto">
                <div className="aspect-video bg-surface-container-lowest">
                  {video.type === "youtube" ? (
                    <iframe
                      src={video.src}
                      title={videoTitle}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : video.type === "vimeo" ? (
                    <iframe
                      src={video.src}
                      title={videoTitle}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video src={video.src} controls className="w-full h-full" />
                  )}
                </div>
              </div>
            );
          }
        }
      }
      return (
        <p
          className="mb-4 leading-relaxed text-on-surface-variant font-body-lg text-base text-pretty break-words"
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

    code: ({ node: _node, className: codeClass, children, ...props }: any) => {
      const hasLanguageClass =
        typeof codeClass === "string" && /\blanguage-[\w-]+/.test(codeClass);
      const textContent = Array.isArray(children)
        ? children.join("")
        : String(children ?? "");
      const isBlockCode = hasLanguageClass || textContent.includes("\n");

      if (!isBlockCode) {
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

    pre: ({ node, children }: any) => (
      <CodePreBlock lang={extractCodeLanguage(node, children)}>
        {children}
      </CodePreBlock>
    ),

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
          <OptimizedImage
            src={src}
            alt={alt || "Project visual"}
            className="w-full h-auto object-contain max-h-[640px] mx-auto"
          />
        </span>
      );
    },

    hr: ({ node: _node, ...props }: any) => (
      <hr className="my-8 border-outline-variant/25" {...props} />
    ),
  };
}

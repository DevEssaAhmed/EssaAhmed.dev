import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { createMarkdownComponents } from "@/components/markdown/markdown-components";
import "highlight.js/styles/atom-one-dark.css";

interface ServerMarkdownRendererProps {
  content: string;
  className?: string;
}

const markdownComponents = createMarkdownComponents();

export default function ServerMarkdownRenderer({
  content,
  className = "",
}: ServerMarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </Markdown>
    </div>
  );
}

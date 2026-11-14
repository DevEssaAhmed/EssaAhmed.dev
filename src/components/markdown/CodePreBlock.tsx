"use client";

import { useRef, useState } from "react";
import { Clipboard, Check } from "lucide-react";

interface CodePreBlockProps {
  children: React.ReactNode;
  lang?: string;
}

export function CodePreBlock({ children, lang: langProp }: CodePreBlockProps) {
  const codeRef = useRef<HTMLPreElement | null>(null);
  const [copied, setCopied] = useState(false);

  const codeChild: any = Array.isArray(children) ? children[0] : children;
  const langMatch =
    typeof codeChild?.props?.className === "string"
      ? codeChild.props.className.match(/language-([\w-]+)/)
      : null;
  const lang = langProp || (langMatch && langMatch[1] ? langMatch[1] : "text");

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
    <div className="group relative my-6 rounded-xl border border-outline-variant/50 dark:border-outline-variant/30 bg-[#F6F5F1] dark:bg-[#0d1117] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-outline-variant/40 dark:border-outline-variant/25 bg-[#ECEAE3] dark:bg-[#161b22]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 border border-rose-500/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 border border-amber-500/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 border border-emerald-500/30" />
          </div>
          <span className="text-[11px] font-code tracking-wider uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
            {lang}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-outline-variant/50 bg-white/90 dark:bg-surface-container-high/90 text-on-surface-variant hover:text-on-surface hover:bg-white dark:hover:bg-surface-container-highest transition-colors"
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
        className="m-0 p-4 overflow-x-auto text-sm leading-relaxed font-code bg-[#F6F5F1] dark:bg-[#0d1117] text-slate-800 dark:text-slate-200"
      >
        {codeChild}
      </pre>
    </div>
  );
}

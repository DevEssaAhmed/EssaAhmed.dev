"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { toast } from "sonner";
import type { SopCodeSnippets } from "@/lib/sop-math";

interface CodeExportPanelProps {
  snippets: SopCodeSnippets;
}

type LangTab = keyof SopCodeSnippets;

const TABS: ReadonlyArray<{ id: LangTab; label: string; badge: string }> = [
  { id: "python", label: "Python (SciPy)", badge: "inventory_policy.py" },
  { id: "sql", label: "SQL (Warehouse)", badge: "sop_reorder_policy.sql" },
  { id: "dax", label: "Power BI (DAX)", badge: "Measures.dax" },
];

export default function CodeExportPanel({ snippets }: CodeExportPanelProps) {
  const [activeTab, setActiveTab] = useState<LangTab>("python");
  const [copied, setCopied] = useState(false);

  const activeMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const activeCode = snippets[activeTab];

  const handleCopy = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    toast.success(`${activeMeta.label} snippet copied!`);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl card-elevated border overflow-hidden">
      <div className="px-5 py-3.5 border-b border-outline-variant/35 bg-surface-container-low/70 dark:bg-surface-container/60 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Implementation language"
          className="inline-flex flex-wrap items-center gap-1.5"
        >
          {TABS.map((tab) => {
            const isSelected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-code transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? "bg-on-surface text-surface font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-code text-[11px] text-outline">
            <Terminal className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
            <span>{activeMeta.badge}</span>
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/45 bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-code transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-secondary" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-on-surface-variant" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[#0D1117] text-slate-100 p-5 overflow-x-auto">
        <pre className="font-code text-xs sm:text-[13px] leading-relaxed whitespace-pre">
          <code>{activeCode}</code>
        </pre>
      </div>
    </div>
  );
}

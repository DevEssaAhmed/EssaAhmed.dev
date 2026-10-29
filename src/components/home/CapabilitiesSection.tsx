"use client";
import { Terminal, Package, BarChart3 } from "lucide-react";

const CapabilitiesSection = () => {
  const stackItems = [
    { name: "Python", dot: "bg-primary" },
    { name: "SQL", dot: "bg-secondary" },
    { name: "dbt", dot: "bg-amber-400" },
    { name: "Power BI", dot: "bg-amber-500" },
    { name: "Snowflake", dot: "bg-cyan-400" },
    { name: "Airflow", dot: "bg-rose-400" },
    { name: "Demand Forecasting", dot: "bg-secondary-fixed" },
    { name: "S&OP Modeling", dot: "bg-emerald-400" },
    { name: "Next.js", dot: "bg-on-surface" },
    { name: "Supabase", dot: "bg-emerald-500" },
    { name: "PostgreSQL", dot: "bg-blue-400" },
    { name: "Docker", dot: "bg-sky-500" },
  ];

  return (
    <section className="max-w-[1080px] mx-auto py-12 px-6">
      <div className="pb-8">
        <h2 className="text-2xl font-headline-md font-bold text-on-surface tracking-tight">
          Core Capabilities
        </h2>
        <p className="text-on-surface-variant font-body-md text-body-md mt-1">
          Engineered systems built for process velocity, inventory precision, and reliable reporting.
        </p>
      </div>

      {/* 3 Sleek Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Pillar 1 */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/60 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
              <Terminal aria-hidden="true" className="text-[24px] h-6 w-6" />
            </div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">
              Workflow &amp; Process Automation
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
              Eliminating repetitive spreadsheet and ERP bottlenecks with automated Python microservices, scheduled pipelines, and real-time webhook/Slack alerts.
            </p>
          </div>
          <ul className="space-y-2 text-label-md font-label-md text-on-surface pt-4 border-t border-outline-variant/20">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Zero-touch scheduled jobs
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Webhook &amp; Slack alerts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Automated ETL reconciliations
            </li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/60 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-5">
              <Package aria-hidden="true" className="text-[24px] h-6 w-6" />
            </div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">
              Supply Chain &amp; Demand Planning
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
              Multi-echelon demand forecasting, inventory replenishment modeling, vendor lead-time tracking, and S&amp;OP scenario planning.
            </p>
          </div>
          <ul className="space-y-2 text-label-md font-label-md text-on-surface pt-4 border-t border-outline-variant/20">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              S&amp;OP forecast modeling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Safety stock optimization
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Vendor SLA &amp; OTIF audit
            </li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:border-outline-variant/60 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary-fixed-dim mb-5">
              <BarChart3 aria-hidden="true" className="text-[24px] h-6 w-6" />
            </div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2">
              Analytics &amp; Decision Systems
            </h3>
            <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed mb-6">
              High-speed dimensional warehouses and executive Power BI cockpits designed for instant root-cause slicing and operational clarity.
            </p>
          </div>
          <ul className="space-y-2 text-label-md font-label-md text-on-surface pt-4 border-t border-outline-variant/20">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />
              Sub-second DAX/SQL queries
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />
              Star schema dimensional modeling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />
              Executive cockpit design
            </li>
          </ul>
        </div>
      </div>

      {/* Core Technical Stack Box */}
      <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6">
        <span className="text-label-sm font-label-sm font-bold tracking-wider text-outline uppercase block mb-4">
          ENGINEERED TOOLKIT &amp; PRODUCTION STACK
        </span>
        <div className="flex flex-wrap gap-2.5">
          {stackItems.map((item) => (
            <span
              key={item.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/25 text-on-surface font-label-md text-label-md"
            >
              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;

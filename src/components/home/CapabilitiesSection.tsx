import { BarChart3, Database, LineChart, Terminal } from "lucide-react";

const CAPABILITIES = [
  {
    icon: LineChart,
    iconClass: "text-champagne",
    stackClass: "text-champagne-dim",
    title: "Data Analysis & Modeling",
    description:
      "Statistical root cause discovery, anomaly detection, cohort tracking, and predictive trend modeling.",
    stack: "SQL · dbt · Python",
  },
  {
    icon: Terminal,
    iconClass: "text-blue-200",
    stackClass: "text-blue-200",
    title: "Python & ETL Pipelines",
    description:
      "Automated ingestion, transformation DAGs, error alerting, and multi-source API synchronizations.",
    stack: "Airflow · Pandas · FastAPIs",
  },
  {
    icon: Database,
    iconClass: "text-tertiary",
    stackClass: "text-tertiary",
    title: "Warehouse Architecture",
    description:
      "Star-schema modeling, dimensional indexing, query latency minimization, and schema governance.",
    stack: "Snowflake · Postgres · BigQuery",
  },
  {
    icon: BarChart3,
    iconClass: "text-lavender",
    stackClass: "text-lavender",
    title: "Data Visualization & BI",
    description:
      "Executive cockpit development, drill-down operational reports, and low-cognitive-load layouts.",
    stack: "Power BI · Tableau · Metabase",
  },
];

const CapabilitiesSection = () => (
  <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 mb-32">
    <div className="p-10 lg:p-14 rounded-3xl bg-surface-low border border-border shadow-2xl relative overflow-hidden">
      <div className="max-w-3xl mb-14">
        <div className="eyebrow mb-3">End-to-End Capabilities</div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Decision Systems Architecture
        </h2>
        <p className="text-sm sm:text-base text-ink-soft mt-3 font-light leading-relaxed">
          Bridging the gap between distributed transactional systems and executive strategy with engineered precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CAPABILITIES.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-7 rounded-xl bg-surface-container border border-border hover:border-champagne/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className={`w-11 h-11 rounded-lg bg-surface-high border border-border flex items-center justify-center mb-6 group-hover:scale-105 transition-transform ${c.iconClass}`}
                >
                  <Icon className="w-[22px] h-[22px]" />
                </div>
                <h3 className="font-display text-base font-semibold text-white mb-2.5">{c.title}</h3>
                <p className="text-[13px] text-ink-soft font-light leading-relaxed">{c.description}</p>
              </div>
              <div className={`mt-8 pt-4 border-t border-border font-mono text-[11px] ${c.stackClass}`}>
                <span>{c.stack}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default CapabilitiesSection;

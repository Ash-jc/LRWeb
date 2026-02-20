import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Create a Project",
    color: "cyan",
    description: "A Project is your workspace for one literature review topic — for example: 'AI in Healthcare' or 'Quantum Computing Algorithms'.",
    actions: [
      "Click Projects in the top menu",
      "Click + New Project",
      'Give it a name (e.g. "Attention Mechanisms in NLP")',
      "Add an optional description of your research question",
      "Click Launch Project",
    ],
    tip: "One project per research topic. You can have as many projects as you like.",
  },
  {
    number: "02",
    title: "Create a Run",
    color: "pink",
    description: "A Run is one execution of the research pipeline inside your project. Think of it like pressing 'Start' on a literature search. Each run captures exactly what settings were used, so your work is always reproducible.",
    actions: [
      "Open a project",
      "Click + New Run",
      "The run starts in PENDING status",
      "Click on the run ID to view its details",
    ],
    tip: "Runs are read-only snapshots — you can always look back at an old run and see exactly what was searched and with what settings.",
  },
  {
    number: "03",
    title: "Add Papers",
    color: "green",
    description: "Papers are the academic articles you want to review. You can add them manually right now (Phase 1), and in future versions the system will automatically discover and fetch them from databases like arXiv, Semantic Scholar, and PubMed.",
    actions: [
      "Papers are added via the API for now (Phase 1)",
      "Each paper stores: title, authors, year, DOI, arXiv ID, abstract",
      "The same paper can appear in multiple projects — it won't be duplicated",
      "In future phases, papers will be auto-fetched by the pipeline",
    ],
    tip: "Phase 1 is the foundation. Paper auto-discovery and AI summarisation are coming in Phase 2 and 3.",
  },
  {
    number: "04",
    title: "Explore Results (Coming Soon)",
    color: "yellow",
    description: "In future phases, completed runs will give you interactive visualisations: an ideas tree, a paper network graph, and a timeline. You will be able to filter, re-arrange, and export everything.",
    actions: [
      "Phase 3: AI-generated summaries per paper",
      "Phase 4: Interactive ideas taxonomy tree",
      "Phase 5: Paper network graph with stored layout",
      "Phase 6: Timeline view with linked brushing",
      "Phase 7: Export to PDF, PPTX, Markdown, LaTeX",
    ],
    tip: "Everything is versioned. Every run you create now is already being stored and will be enriched as new features are added.",
  },
];

const colorMap: Record<string, { heading: string; border: string; num: string }> = {
  cyan:   { heading: "neon-cyan",  border: "border-cyber-border/40",       num: "text-cyber-cyan" },
  pink:   { heading: "neon-pink",  border: "border-cyber-pink/40",         num: "text-cyber-pink" },
  green:  { heading: "neon-green", border: "border-[#39ff14]/40",          num: "text-[#39ff14]" },
  yellow: { heading: "text-[#ffe600]", border: "border-[#ffe600]/40",      num: "text-[#ffe600]" },
};

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-cyber-muted font-mono mb-1 uppercase tracking-widest">&gt; System Documentation</p>
        <h1 className="cyber-heading text-3xl font-bold neon-cyan mb-3">Beginner Guide</h1>
        <p className="text-cyber-muted font-mono text-sm">
          Welcome to <span className="text-cyber-cyan">LRWeb</span> — an agent-assisted platform for academic literature reviews.
          This guide will get you from zero to running your first research pipeline.
        </p>
      </div>

      {/* What is LRWeb */}
      <div className="cyber-card relative p-6 mb-8">
        <div className="corner-tl corner-br" />
        <h2 className="cyber-heading text-lg font-bold neon-cyan mb-3">What is LRWeb?</h2>
        <p className="text-sm text-cyber-muted font-mono leading-relaxed mb-4">
          LRWeb helps researchers — even non-programmers — conduct systematic literature reviews.
          Instead of manually searching Google Scholar, downloading PDFs, and copying notes into a spreadsheet,
          LRWeb will (in later phases) automatically:
        </p>
        <ul className="space-y-2 text-sm font-mono">
          {[
            ["🔍", "Search academic databases for relevant papers"],
            ["📄", "Read and summarise each paper using AI"],
            ["🌳", "Group papers into a visual ideas tree"],
            ["🕸️", "Build a network graph of how papers relate"],
            ["📊", "Create a timeline of how research evolved"],
            ["📝", "Write a full literature review report"],
            ["📤", "Export everything as PDF, slides, or LaTeX"],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-3 items-start text-cyber-muted">
              <span>{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-cyber-muted font-mono border-t border-cyber-border/20 pt-4">
          <span className="neon-cyan">Phase 1 (now):</span> Project and run management, paper indexing, and the full API backbone.
          AI features arrive in Phase 2+.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6 mb-10">
        {steps.map((step) => {
          const c = colorMap[step.color];
          return (
            <div key={step.number} className={`cyber-card relative p-6 border ${c.border}`}>
              <div className="corner-tl corner-br" />
              <div className="flex items-start gap-4">
                <span className={`cyber-heading text-4xl font-black ${c.num} opacity-40 shrink-0`}>
                  {step.number}
                </span>
                <div className="flex-1">
                  <h3 className={`cyber-heading text-base font-bold ${c.heading} mb-2`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-cyber-muted font-mono leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {step.actions.map((action) => (
                      <li key={action} className="flex gap-2 text-xs font-mono text-cyber-text">
                        <span className="text-cyber-cyan shrink-0">&gt;</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`text-xs font-mono border-l-2 pl-3 ${c.border} text-cyber-muted`}>
                    💡 {step.tip}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Glossary */}
      <div className="cyber-card relative p-6 mb-8">
        <div className="corner-tl corner-br" />
        <h2 className="cyber-heading text-lg font-bold neon-pink mb-4">Glossary</h2>
        <dl className="space-y-3 font-mono text-sm">
          {[
            ["Project",        "Your top-level workspace for one research topic."],
            ["Run",            "A single execution of the research pipeline. Runs are immutable — they record exactly what was done and when."],
            ["Paper",          "A canonical record of an academic paper (title, authors, DOI, abstract). Shared across projects."],
            ["Config Snapshot","The frozen settings used for a run — model, prompts, privacy mode. Never changes after creation."],
            ["Pipeline",       "The sequence of automated steps: search → summarise → embed → cluster → visualise → export."],
            ["Phase",          "A development milestone. We are in Phase 1 (foundation). Future phases add AI and visualisation."],
          ].map(([term, def]) => (
            <div key={term} className="grid grid-cols-[140px_1fr] gap-4 border-b border-cyber-border/10 pb-3">
              <dt className="text-cyber-cyan font-bold uppercase text-xs">{term}</dt>
              <dd className="text-cyber-muted text-xs">{def}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* CTA */}
      <div className="text-center py-6">
        <p className="text-cyber-muted font-mono text-sm mb-4">
          Ready to start your first literature review?
        </p>
        <Link href="/projects" className="btn-cyber px-8 py-3 text-sm inline-block">
          &gt;&gt; Go to Projects
        </Link>
      </div>
    </div>
  );
}

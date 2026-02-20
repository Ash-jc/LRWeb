"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type ProjectPaper, type Run } from "@/lib/api";

export default function RunDetailPage() {
  const { id, runId } = useParams<{ id: string; runId: string }>();

  const { data: run, isLoading: loadingRun } = useQuery<Run>({
    queryKey: ["run", id, runId],
    queryFn: () => api.runs.get(id, runId),
  });

  const { data: papers, isLoading: loadingPapers } = useQuery<ProjectPaper[]>({
    queryKey: ["papers", id],
    queryFn: () => api.papers.list(id),
  });

  if (loadingRun) return <p className="text-cyber-cyan font-mono animate-pulse">&gt; Fetching run data...</p>;
  if (!run) return <p className="neon-pink font-mono">✗ RUN NOT FOUND</p>;

  return (
    <div>
      {/* Breadcrumb */}
      <p className="text-xs text-cyber-muted font-mono mb-6">
        <Link href="/projects" className="hover:text-cyber-cyan transition-colors">PROJECTS</Link>
        <span className="mx-2 text-cyber-border/40">/</span>
        <Link href={`/projects/${id}`} className="hover:text-cyber-cyan transition-colors">PROJECT</Link>
        <span className="mx-2 text-cyber-border/40">/</span>
        <span className="text-cyber-cyan">RUN {run.id.slice(0, 8).toUpperCase()}</span>
      </p>

      {/* Run metadata card */}
      <div className="cyber-card relative p-6 mb-8">
        <div className="corner-tl corner-br" />
        <p className="text-xs text-cyber-muted font-mono mb-1 uppercase tracking-widest">Pipeline Execution</p>
        <h1 className="cyber-heading text-xl font-bold neon-cyan mb-6">
          Run Log
        </h1>

        <div className="grid grid-cols-2 gap-6 text-sm font-mono mb-6">
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-1">Status</p>
            <span className={`border px-2 py-0.5 text-xs ${
              run.status === "pending"   ? "badge-pending"   :
              run.status === "running"   ? "badge-running"   :
              run.status === "completed" ? "badge-completed" : "badge-failed"
            }`}>
              {run.status.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-1">Run ID</p>
            <p className="text-cyber-cyan">{run.id.slice(0, 16).toUpperCase()}…</p>
          </div>
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-1">Initiated</p>
            <p>{new Date(run.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-1">Completed</p>
            <p>{run.completed_at ? new Date(run.completed_at).toLocaleString() : <span className="text-cyber-muted">—</span>}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-cyber-muted uppercase tracking-widest mb-2 font-mono">Config Snapshot</p>
          <pre className="bg-cyber-bg border border-cyber-border/20 p-4 text-xs text-cyber-cyan overflow-x-auto">
            {JSON.stringify(run.config_snapshot, null, 2) || "{}"}
          </pre>
        </div>
      </div>

      {/* Papers section */}
      <div className="mb-4">
        <p className="text-xs text-cyber-muted font-mono mb-1 uppercase tracking-widest">&gt; Indexed Papers</p>
        <h2 className="cyber-heading text-lg font-bold text-cyber-cyan">Papers</h2>
      </div>

      {loadingPapers && (
        <p className="text-cyber-cyan font-mono text-sm animate-pulse">&gt; Scanning paper database...</p>
      )}

      {papers && papers.length === 0 && (
        <div className="cyber-card p-6 text-center">
          <p className="text-cyber-muted font-mono text-sm">
            No papers indexed in this project yet.
          </p>
        </div>
      )}

      {papers && papers.length > 0 && (
        <div className="cyber-card overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-cyber-border/20 text-xs uppercase tracking-widest text-cyber-muted">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Authors</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Score</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((pp) => (
                <tr key={pp.id} className="border-b border-cyber-border/10 hover:bg-cyber-border/5 transition-colors">
                  <td className="px-4 py-3 text-cyber-cyan">{pp.paper.title}</td>
                  <td className="px-4 py-3 text-cyber-muted">{pp.paper.authors.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-cyber-muted">{pp.paper.year ?? "—"}</td>
                  <td className="px-4 py-3">
                    {pp.score !== null
                      ? <span className="neon-green">{pp.score.toFixed(2)}</span>
                      : <span className="text-cyber-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

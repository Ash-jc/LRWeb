"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type Project, type Run } from "@/lib/api";

const STATUS_CLASS: Record<string, string> = {
  pending:   "badge-pending",
  running:   "badge-running",
  completed: "badge-completed",
  failed:    "badge-failed",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: project, isLoading: loadingProject } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: () => api.projects.get(id),
  });

  const { data: runs, isLoading: loadingRuns } = useQuery<Run[]>({
    queryKey: ["runs", id],
    queryFn: () => api.runs.list(id),
  });

  const createRun = useMutation({
    mutationFn: () => api.runs.create(id, { config_snapshot: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["runs", id] }),
  });

  if (loadingProject) {
    return <p className="text-cyber-cyan font-mono animate-pulse">&gt; Loading project node...</p>;
  }
  if (!project) {
    return <p className="neon-pink font-mono">✗ PROJECT NODE NOT FOUND</p>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <p className="text-xs text-cyber-muted font-mono mb-6">
        <Link href="/projects" className="hover:text-cyber-cyan transition-colors">PROJECTS</Link>
        <span className="mx-2 text-cyber-border/40">/</span>
        <span className="text-cyber-cyan uppercase">{project.name}</span>
      </p>

      {/* Project header */}
      <div className="cyber-card relative p-6 mb-8">
        <div className="corner-tl corner-br" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-cyber-muted font-mono mb-1 uppercase tracking-widest">
              Research Node
            </p>
            <h1 className="cyber-heading text-2xl font-bold neon-cyan mb-2">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-cyber-muted font-mono max-w-xl">
                {project.description}
              </p>
            )}
          </div>
          <div className="text-right text-xs font-mono text-cyber-muted shrink-0">
            <div className="neon-green text-xs mb-1">● ONLINE</div>
            <div>INIT: {new Date(project.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Runs section */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-cyber-muted font-mono mb-1 uppercase tracking-widest">&gt; Pipeline Executions</p>
          <h2 className="cyber-heading text-lg font-bold text-cyber-cyan">Runs</h2>
        </div>
        <button
          onClick={() => createRun.mutate()}
          disabled={createRun.isPending}
          className="btn-cyber px-4 py-2 text-xs"
        >
          {createRun.isPending ? ">> Launching..." : "+ New Run"}
        </button>
      </div>

      {loadingRuns && (
        <p className="text-cyber-cyan font-mono text-sm animate-pulse">&gt; Fetching run data...</p>
      )}

      {runs && runs.length === 0 && (
        <div className="cyber-card p-6 text-center">
          <p className="text-cyber-muted font-mono text-sm">
            No pipeline runs yet. Click <span className="text-cyber-cyan">+ New Run</span> to start one.
          </p>
        </div>
      )}

      {runs && runs.length > 0 && (
        <div className="cyber-card overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-cyber-border/20 text-xs uppercase tracking-widest text-cyber-muted">
                <th className="px-4 py-3 text-left">Run ID</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Initiated</th>
                <th className="px-4 py-3 text-left">Completed</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-cyber-border/10 hover:bg-cyber-border/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${id}/runs/${run.id}`}
                      className="neon-cyan hover:underline"
                    >
                      {run.id.slice(0, 8).toUpperCase()}…
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`border px-2 py-0.5 text-xs ${STATUS_CLASS[run.status] ?? "text-cyber-muted border-cyber-muted"}`}>
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cyber-muted">
                    {new Date(run.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-cyber-muted">
                    {run.completed_at ? new Date(run.completed_at).toLocaleString() : "—"}
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

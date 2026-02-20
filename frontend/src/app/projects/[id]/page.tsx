"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, type Project, type Run } from "@/lib/api";

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

  if (loadingProject) return <p className="text-gray-500">Loading…</p>;
  if (!project) return <p className="text-red-600">Project not found.</p>;

  return (
    <div>
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/projects" className="hover:underline">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{project.name}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-gray-600">{project.description}</p>
        )}
      </div>

      {/* Runs section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Runs</h2>
          <button
            onClick={() => createRun.mutate()}
            disabled={createRun.isPending}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createRun.isPending ? "Creating…" : "+ New Run"}
          </button>
        </div>

        {loadingRuns && <p className="text-gray-500">Loading runs…</p>}

        {runs && runs.length === 0 && (
          <p className="text-gray-500 text-sm">No runs yet.</p>
        )}

        {runs && runs.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/projects/${id}/runs/${run.id}`}
                        className="font-mono text-indigo-600 hover:underline"
                      >
                        {run.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    running: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
}

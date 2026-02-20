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

  if (loadingRun) return <p className="text-gray-500">Loading…</p>;
  if (!run) return <p className="text-red-600">Run not found.</p>;

  return (
    <div>
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/projects" className="hover:underline">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${id}`} className="hover:underline">Project</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Run {run.id.slice(0, 8)}…</span>
      </nav>

      <h1 className="mb-2 text-2xl font-bold">Run Detail</h1>

      {/* Run metadata */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Status</dt>
            <dd className="mt-1">{run.status}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Created</dt>
            <dd className="mt-1">{new Date(run.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Completed</dt>
            <dd className="mt-1">{run.completed_at ? new Date(run.completed_at).toLocaleString() : "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-medium text-gray-500">Config Snapshot</dt>
            <dd className="mt-1">
              <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                {JSON.stringify(run.config_snapshot, null, 2)}
              </pre>
            </dd>
          </div>
        </dl>
      </div>

      {/* Papers table */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Papers in This Project</h2>

        {loadingPapers && <p className="text-gray-500">Loading papers…</p>}

        {papers && papers.length === 0 && (
          <p className="text-gray-500 text-sm">No papers added to this project yet.</p>
        )}

        {papers && papers.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authors</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {papers.map((pp) => (
                  <tr key={pp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{pp.paper.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {pp.paper.authors.join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{pp.paper.year ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {pp.score !== null ? pp.score.toFixed(2) : "—"}
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

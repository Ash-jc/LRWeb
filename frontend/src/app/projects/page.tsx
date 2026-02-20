"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api, type Project } from "@/lib/api";

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: api.projects.list,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Project
        </Link>
      </div>

      {isLoading && <p className="text-gray-500">Loading…</p>}
      {error && (
        <p className="text-red-600">Failed to load projects: {(error as Error).message}</p>
      )}

      {projects && projects.length === 0 && (
        <p className="text-gray-500">No projects yet. Create your first one!</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {projects?.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{p.name}</h2>
            {p.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{p.description}</p>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Created {new Date(p.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

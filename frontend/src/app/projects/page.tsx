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
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs text-cyber-muted font-mono mb-1 tracking-widest uppercase">
            &gt; Active Research Nodes
          </p>
          <h1 className="cyber-heading text-3xl font-bold neon-cyan">
            Projects
          </h1>
        </div>
        <Link href="/projects/new" className="btn-cyber px-5 py-2 text-sm rounded-none">
          + New Project
        </Link>
      </div>

      {isLoading && (
        <div className="text-cyber-cyan font-mono animate-pulse text-sm">
          &gt; Scanning database nodes...
        </div>
      )}
      {error && (
        <div className="neon-pink font-mono text-sm border border-cyber-pink/30 p-4">
          ✗ CONNECTION ERROR: {(error as Error).message}
        </div>
      )}

      {/* Empty state */}
      {projects && projects.length === 0 && (
        <div className="cyber-card relative p-8 text-center mt-4">
          <div className="corner-tl corner-br" />
          <p className="neon-cyan cyber-heading text-lg mb-2">NO PROJECTS FOUND</p>
          <p className="text-cyber-muted text-sm mb-6">
            Initialize your first research project to begin the literature scan.
          </p>
          <Link href="/projects/new" className="btn-cyber px-6 py-2 text-sm inline-block">
            Initialize First Project
          </Link>
          <div className="mt-8 border-t border-cyber-border/20 pt-6">
            <p className="text-cyber-muted text-xs mb-3 uppercase tracking-widest">New here?</p>
            <Link href="/help" className="btn-pink px-4 py-2 text-xs inline-block">
              ? View Beginner Guide
            </Link>
          </div>
        </div>
      )}

      {/* Project grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((p, i) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="cyber-card relative block p-5 group"
          >
            <div className="corner-tl corner-br" />
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-cyber-muted font-mono">
                NODE_{String(i + 1).padStart(3, "0")}
              </span>
              <span className="text-xs neon-green font-mono">● ONLINE</span>
            </div>
            <h2 className="font-bold text-cyber-cyan cyber-heading text-sm uppercase tracking-wider mb-2 group-hover:neon-cyan">
              {p.name}
            </h2>
            {p.description && (
              <p className="text-xs text-cyber-muted line-clamp-2 mb-4 font-mono">
                {p.description}
              </p>
            )}
            <div className="border-t border-cyber-border/20 pt-3 flex justify-between items-center">
              <span className="text-xs text-cyber-muted font-mono">
                {new Date(p.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs neon-cyan font-mono group-hover:animate-pulse">
                ENTER →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

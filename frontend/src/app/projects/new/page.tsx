"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.projects.create({ name, description }),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/projects/${project.id}`);
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      {/* Breadcrumb */}
      <p className="text-xs text-cyber-muted font-mono mb-6">
        <Link href="/projects" className="hover:text-cyber-cyan transition-colors">PROJECTS</Link>
        <span className="mx-2 text-cyber-border/40">/</span>
        <span className="text-cyber-cyan">NEW NODE</span>
      </p>

      <div className="cyber-card relative p-8">
        <div className="corner-tl corner-br" />

        <h1 className="cyber-heading text-xl font-bold neon-cyan mb-1">
          Initialize Project
        </h1>
        <p className="text-xs text-cyber-muted font-mono mb-8">
          &gt; Configure new research node parameters
        </p>

        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) mutation.mutate(); }} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-cyber-cyan uppercase tracking-widest mb-2">
              Project Name <span className="neon-pink">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="cyber-input w-full px-4 py-3 text-sm rounded-none"
              placeholder="e.g. Transformer Architecture Survey"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-cyber-cyan uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="cyber-input w-full px-4 py-3 text-sm rounded-none resize-none"
              placeholder="What research question does this project address?"
            />
          </div>

          {mutation.error && (
            <div className="neon-pink text-xs font-mono border border-cyber-pink/30 p-3">
              ✗ ERROR: {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="btn-cyber px-6 py-3 text-sm flex-1"
            >
              {mutation.isPending ? ">> Initializing..." : ">> Launch Project"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-pink px-4 py-3 text-sm"
            >
              Abort
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Typed API client. In the browser, requests go through Next.js rewrites
 * (/api/*  →  backend). On the server, we use BACKEND_URL directly.
 */

const BASE =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? "http://localhost:8000")
    : "/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  project_id: string;
  status: string;
  config_snapshot: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

export interface Paper {
  id: string;
  doi: string | null;
  arxiv_id: string | null;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string | null;
  created_at: string;
}

export interface ProjectPaper {
  id: string;
  project_id: string;
  paper_id: string;
  inclusion_reason: string | null;
  score: number | null;
  added_at: string;
  paper: Paper;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const DEFAULT_USER_ID =
  typeof window !== "undefined"
    ? (localStorage.getItem("lrweb_user_id") ?? "00000000-0000-0000-0000-000000000001")
    : "00000000-0000-0000-0000-000000000001";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-User-Id": DEFAULT_USER_ID,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const api = {
  projects: {
    list: () => request<Project[]>("/projects"),
    get: (id: string) => request<Project>(`/projects/${id}`),
    create: (body: { name: string; description?: string }) =>
      request<Project>("/projects", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { name?: string; description?: string }) =>
      request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  },

  runs: {
    list: (projectId: string) => request<Run[]>(`/projects/${projectId}/runs`),
    get: (projectId: string, runId: string) =>
      request<Run>(`/projects/${projectId}/runs/${runId}`),
    create: (projectId: string, body: { config_snapshot?: Record<string, unknown> }) =>
      request<Run>(`/projects/${projectId}/runs`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  papers: {
    list: (projectId: string) => request<ProjectPaper[]>(`/projects/${projectId}/papers`),
    get: (projectId: string, paperId: string) =>
      request<ProjectPaper>(`/projects/${projectId}/papers/${paperId}`),
    add: (
      projectId: string,
      body: {
        title: string;
        authors?: string[];
        year?: number;
        doi?: string;
        arxiv_id?: string;
        abstract?: string;
      }
    ) =>
      request<ProjectPaper>(`/projects/${projectId}/papers`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
};

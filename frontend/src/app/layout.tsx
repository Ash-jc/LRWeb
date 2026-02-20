import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/query-client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LRWeb — Literature Review Platform",
  description: "Agent-assisted, interactive literature review.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cyber-bg cyber-grid text-cyber-text">
        <ReactQueryProvider>
          {/* Header */}
          <header className="border-b border-cyber-border/30 bg-cyber-bg/90 backdrop-blur sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
              <Link href="/projects" className="flex items-center gap-3 group">
                <span className="text-xs text-cyber-muted font-mono">SYS://</span>
                <span
                  className="cyber-heading text-xl font-bold neon-cyan tracking-widest group-hover:animate-pulse-slow"
                >
                  LR<span className="neon-pink">WEB</span>
                </span>
                <span className="text-xs text-cyber-muted font-mono hidden sm:block">v0.1.0</span>
              </Link>

              <nav className="flex items-center gap-4 text-sm font-mono">
                <Link
                  href="/projects"
                  className="text-cyber-muted hover:text-cyber-cyan transition-colors uppercase tracking-wider text-xs"
                >
                  Projects
                </Link>
                <Link
                  href="/help"
                  className="text-cyber-muted hover:neon-cyan transition-colors uppercase tracking-wider text-xs border border-cyber-muted/30 px-2 py-1 hover:border-cyber-cyan hover:text-cyber-cyan"
                >
                  ? Help
                </Link>
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto max-w-6xl px-6 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-cyber-border/20 mt-16 py-4 text-center text-xs text-cyber-muted font-mono">
            <span className="neon-cyan opacity-60">■</span>
            {" "}LRWEB NEURAL INTERFACE v0.1.0 — PHASE 1 ONLINE{" "}
            <span className="neon-cyan opacity-60">■</span>
          </footer>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

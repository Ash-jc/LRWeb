import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "LRWeb — Literature Review Platform",
  description: "Interactive, agent-assisted literature review.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ReactQueryProvider>
          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <a href="/projects" className="text-xl font-semibold tracking-tight text-indigo-600">
              LRWeb
            </a>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

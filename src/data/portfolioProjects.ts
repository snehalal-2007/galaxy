import type { ProjectPortfolioEntry } from "@/components/ProjectDetailView";
import portfolioData from "./projects.json";

function sortedGlobUrls(record: Record<string, string>): string[] {
  return Object.entries(record)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url);
}

/** `src/images/<projectId>/*.{jpeg,jpg,png}` — Vite resolves to hashed URLs in production. */
const localGalleryByProjectId = (() => {
  const modules = import.meta.glob<string>("../images/*/*.{jpeg,jpg,png,JPEG,JPG,PNG}", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>;

  const byId: Record<string, Record<string, string>> = {};
  for (const [path, url] of Object.entries(modules)) {
    const m = path.match(/\/images\/([^/]+)\//);
    if (!m) continue;
    const id = m[1];
    if (!byId[id]) byId[id] = {};
    byId[id][path] = url;
  }

  const out: Record<string, string[]> = {};
  for (const [id, paths] of Object.entries(byId)) {
    out[id] = sortedGlobUrls(paths);
  }
  return out;
})();

export const portfolioProjects: ProjectPortfolioEntry[] = (
  portfolioData.projects as ProjectPortfolioEntry[]
).map((p) => {
  const local = localGalleryByProjectId[p.id];
  if (local && local.length > 0) return { ...p, images: local };
  return p;
});

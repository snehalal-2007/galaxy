/**
 * Resolves the resume PDF in src/data/ (any case: resume.pdf / Resume.pdf) to a
 * hashed asset URL that Vite bundles for production. Uses a glob so the app never
 * crashes when the file is absent — `resumeUrl` is simply `undefined` until a
 * "resume.pdf" exists, then resolves automatically (the nav link appears).
 */
const pdfs = import.meta.glob("./*.pdf", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const match = Object.entries(pdfs).find(([path]) => /resume\.pdf$/i.test(path));

export const resumeUrl: string | undefined = match?.[1];

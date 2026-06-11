import educationData from "./education.json";

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  timeline: string;
  gpa?: string;
  details?: string[];
  /** Resolved logo image URL (Vite-hashed), attached by id below. */
  logo?: string;
};

/** All images in src/data/; we pick out the school logos by filename below. */
const images = import.meta.glob("./*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName = (name: RegExp): string | undefined =>
  Object.entries(images).find(([path]) => name.test(path))?.[1];

/** Map each education id to its logo file. */
const logoById: Record<string, string | undefined> = {
  utd: byName(/UTD\.png$/i),
  prosper: byName(/PHS\.png$/i),
};

export const education: EducationEntry[] = (educationData.education as EducationEntry[]).map(
  (e) => ({ ...e, logo: logoById[e.id] })
);

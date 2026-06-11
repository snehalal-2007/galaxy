import certificationData from "./certifications.json";

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  year: string;
  /** Public verification URL — opens in a new tab when the certificate is clicked. */
  verifyUrl?: string;
  /** Resolved image URL (Vite hashes the file from src/images/certifications). */
  image?: string;
};

/**
 * `src/images/certifications/*` — Vite resolves to hashed URLs in production.
 * Sorted by filename and zipped to the JSON entries in order, so dropping in
 * real images named to sort the same way (e.g. cert-01..cert-08) replaces the dummies.
 */
const certificateImages = (() => {
  const modules = import.meta.glob<string>(
    "../images/certifications/*.{svg,png,jpg,jpeg,webp,SVG,PNG,JPG,JPEG,WEBP}",
    { eager: true, query: "?url", import: "default" }
  ) as Record<string, string>;

  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url);
})();

export const certifications: Certification[] = (
  certificationData.certifications as Certification[]
).map((c, i) => ({ ...c, image: certificateImages[i] ?? c.image }));

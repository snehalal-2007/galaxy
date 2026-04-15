import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Github } from "lucide-react";
import { SkillTechIcon } from "@/lib/skillTechIcons";
import { cn } from "@/lib/utils";

export type ProjectSkill = { name: string };

export type ProjectPortfolioEntry = {
  id: string;
  title: string;
  description: string;
  features?: string[];
  images: string[];
  skills: ProjectSkill[];
  liveUrl?: string;
  githubUrl: string;
};

const iconLinkBtn =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground transition hover:border-foreground/40 hover:bg-card/70 hover:text-foreground";

/** True when `liveUrl` is a real deploy link (empty, invalid, or example.com = not deployed). */
function isActiveLiveUrl(raw: string | undefined): boolean {
  const s = raw?.trim() ?? "";
  if (!s) return false;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    if (host === "example.com" || host === "www.example.com") return false;
    return true;
  } catch {
    return false;
  }
}

/** Live + GitHub icon links (used in the galaxy project sticky header). */
export function ProjectExternalLinks({ project }: { project: ProjectPortfolioEntry }) {
  const githubHref = project.githubUrl?.trim();
  const liveRaw = project.liveUrl?.trim() ?? "";
  const liveActive = isActiveLiveUrl(project.liveUrl);
  if (!githubHref && !liveRaw) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
      {liveRaw ? (
        liveActive ? (
          <a
            href={liveRaw}
            target="_blank"
            rel="noopener noreferrer"
            className={iconLinkBtn}
            aria-label={`${project.title} live site`}
          >
            <ExternalLink className="h-5 w-5" strokeWidth={1.75} />
          </a>
        ) : (
          <span
            className={cn(iconLinkBtn, "cursor-not-allowed opacity-45")}
            aria-disabled="true"
            aria-label="Live site not deployed yet"
            title="Not deployed yet"
          >
            <ExternalLink className="h-5 w-5" strokeWidth={1.75} />
          </span>
        )
      ) : null}
      {githubHref ? (
        <a
          href={githubHref}
          target="_blank"
          rel="noopener noreferrer"
          className={iconLinkBtn}
          aria-label={`${project.title} on GitHub`}
        >
          <Github className="h-5 w-5" strokeWidth={1.75} />
        </a>
      ) : null}
    </div>
  );
}

function ProjectGalleryBox({
  projectId,
  title,
  images,
}: {
  projectId: string;
  title: string;
  images: string[];
}) {
  const [index, setIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setIndex(0);
  }, [projectId]);

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [index]);

  if (images.length === 0) {
    return <p className="text-muted-foreground text-sm">No gallery images yet.</p>;
  }

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-border/70 bg-background/30 p-3 shadow-inner md:gap-4 md:p-4"
      aria-label={`${title} gallery`}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border/70 bg-muted/40">
        <img
          src={images[index]}
          alt={`${title} screenshot ${index + 1} of ${images.length}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-foreground backdrop-blur-sm transition hover:bg-black/65"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-foreground backdrop-blur-sm transition hover:bg-black/65"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[0.65rem] tabular-nums tracking-wider text-foreground/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              {index + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      <div
        className={cn(
          "min-h-0 flex gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-0.5",
          "[scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.35)_transparent]",
          "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"
        )}
      >
        {images.map((src, i) => (
          <button
            key={`${projectId}-thumb-${i}`}
            ref={(el) => {
              thumbRefs.current[i] = el;
            }}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "relative h-14 w-24 shrink-0 overflow-hidden rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-[4.25rem] md:w-[7.25rem]",
              i === index
                ? "border-foreground/55 ring-1 ring-foreground/25"
                : "border-border/60 opacity-85 hover:opacity-100"
            )}
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          >
            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetailView({ project }: { project: ProjectPortfolioEntry }) {
  const features = project.features ?? [];

  return (
    <section aria-labelledby={`project-title-${project.id}`}>
      <div className="grid gap-8 md:grid-cols-2 md:gap-10 md:items-start">
        <div className="min-w-0 space-y-8">
          <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
            {project.description}
          </p>

          <div>
            <h3 className="text-muted-foreground mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
              Features
            </h3>
            {features.length > 0 ? (
              <ul className="m-0 list-none space-y-2.5 p-0">
                {features.map((line) => (
                  <li
                    key={line}
                    className="relative pl-5 text-sm leading-relaxed text-foreground/90 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[rgb(95,115,150)] before:content-['']"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Add a features array in projects.json.</p>
            )}
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
              Tech stack
            </h3>
            {project.skills.length > 0 ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {project.skills.map((skill, index) => (
                  <li key={`${project.id}-${skill.name}-${index}`}>
                    <span
                      className="inline-flex items-center gap-2 border border-border/80 bg-card/50 px-2.5 py-1.5 text-xs tracking-wide text-foreground backdrop-blur-sm transition hover:border-foreground/35 hover:bg-card/70 md:px-3"
                      style={{ letterSpacing: "0.06em" }}
                    >
                      <SkillTechIcon label={skill.name} />
                      <span className="min-w-0 font-medium">{skill.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">Add skills in projects.json for the tech stack.</p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <ProjectGalleryBox projectId={project.id} title={project.title} images={project.images} />
        </div>
      </div>
    </section>
  );
}

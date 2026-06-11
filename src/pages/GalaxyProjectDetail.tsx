import { useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { portfolioProjects } from "@/data/portfolioProjects";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import {
  ProjectDetailView,
  ProjectExternalLinks,
} from "@/components/ProjectDetailView";

const seeds = portfolioProjects;

/** Fixed left/right arrow that jumps to the previous/next project (tablet + desktop). */
function ProjectEdgeArrow({ to, side, title }: { to: string; side: "prev" | "next"; title: string }) {
  const isPrev = side === "prev";
  const Chevron = isPrev ? ChevronLeft : ChevronRight;
  return (
    <Link
      to={to}
      aria-label={`${isPrev ? "Previous" : "Next"} project: ${title}`}
      title={title}
      className={cn(
        "group fixed top-1/2 z-30 hidden -translate-y-1/2 items-center gap-2 md:flex",
        isPrev ? "left-2 flex-row lg:left-4" : "right-2 flex-row-reverse lg:right-4"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/50 text-foreground backdrop-blur-sm transition group-hover:border-foreground/45 group-hover:bg-black/70 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <Chevron className="h-5 w-5" />
      </span>
      <span
        className={cn(
          "max-w-0 overflow-hidden whitespace-nowrap text-xs uppercase tracking-[0.15em] text-foreground/80 opacity-0 transition-all duration-300 group-hover:max-w-[12rem] group-hover:opacity-100",
          isPrev ? "text-left" : "text-right"
        )}
      >
        {title}
      </span>
    </Link>
  );
}

const GalaxyProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const index = projectId ? seeds.findIndex((p) => p.id === projectId) : -1;
  const project = index >= 0 ? seeds[index] : undefined;
  const hasSiblings = seeds.length > 1;
  // No wrap-around: first project has no previous, last has no next.
  const prev = project && index > 0 ? seeds[index - 1] : undefined;
  const next = project && index >= 0 && index < seeds.length - 1 ? seeds[index + 1] : undefined;

  // Arrow-key navigation between projects (each side works independently).
  useEffect(() => {
    if (!prev && !next) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "ArrowLeft" && prev) navigate(`/galaxy/project/${prev.id}`);
      else if (e.key === "ArrowRight" && next) navigate(`/galaxy/project/${next.id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, prev, next]);

  if (!project) {
    return <Navigate to="/galaxy" replace />;
  }

  return (
    <CosmicPageShell>
      {prev ? <ProjectEdgeArrow to={`/galaxy/project/${prev.id}`} side="prev" title={prev.title} /> : null}
      {next ? <ProjectEdgeArrow to={`/galaxy/project/${next.id}`} side="next" title={next.title} /> : null}

      <CosmicStickyTitleLayout
        maxWidth="6xl"
        title={
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex w-full items-center justify-between gap-3">
              <Link
                to="/galaxy"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Back to galaxy
              </Link>
              {hasSiblings ? (
                <span className="text-xs tabular-nums tracking-[0.2em] text-muted-foreground">
                  {index + 1} / {seeds.length}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
              <h1
                id={`project-title-${project.id}`}
                className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow md:text-left"
              >
                {project.title}
              </h1>
              <ProjectExternalLinks project={project} />
            </div>
          </div>
        }
      >
        <Reveal key={project.id} y={0}>
          <ProjectDetailView project={project} />
        </Reveal>

        {/* Mobile prev/next bar (edge arrows are hidden on small screens). */}
        {prev || next ? (
          <nav
            className="mt-10 flex items-stretch justify-between gap-3 border-t border-border/40 pt-5 md:hidden"
            aria-label="Project navigation"
          >
            {prev ? (
              <Link
                to={`/galaxy/project/${prev.id}`}
                className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/70 bg-card/40 px-3 py-2.5 text-foreground transition hover:border-foreground/35 hover:bg-card/60"
              >
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                <span className="min-w-0">
                  <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Previous</span>
                  <span className="block truncate text-sm font-medium">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span className="flex-1" aria-hidden="true" />
            )}
            {next ? (
              <Link
                to={`/galaxy/project/${next.id}`}
                className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-border/70 bg-card/40 px-3 py-2.5 text-right text-foreground transition hover:border-foreground/35 hover:bg-card/60"
              >
                <span className="min-w-0">
                  <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Next</span>
                  <span className="block truncate text-sm font-medium">{next.title}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              </Link>
            ) : (
              <span className="flex-1" aria-hidden="true" />
            )}
          </nav>
        ) : null}
      </CosmicStickyTitleLayout>
    </CosmicPageShell>
  );
};

export default GalaxyProjectDetail;

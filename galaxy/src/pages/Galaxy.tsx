import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import type { ProjectPortfolioEntry } from "@/components/ProjectDetailView";
import portfolioData from "@/data/projects.json";
import galaxyTelescopeAscii from "@/data/galaxy-telescope.txt?raw";

type Project = ProjectPortfolioEntry & { x: number; y: number };

/** Stable 0–1 hash for layout (no runtime randomness). */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function scatterForProject(id: string): { x: number; y: number } {
  const margin = 0.08;
  const span = 1 - 2 * margin;
  return {
    x: margin + hash01(`${id}\0lon`) * span,
    y: margin + hash01(`${id}\0lat`) * span,
  };
}

const PROJECT_SEEDS = portfolioData.projects as ProjectPortfolioEntry[];

const Galaxy = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const projects = useMemo(
    () => PROJECT_SEEDS.map((p) => ({ ...p, ...scatterForProject(p.id) })) as Project[],
    []
  );

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getPos = useCallback(
    (p: Project) => ({
      x: p.x * dims.w,
      y: p.y * dims.h,
    }),
    [dims]
  );

  return (
    <CosmicPageShell>
      <CosmicStickyTitleLayout
        contentInnerClassName="pt-0 pb-10 md:pb-12"
        contentMaxWidth="full"
        headerExtra={
          <p className="text-muted-foreground text-center text-xs" style={{ letterSpacing: "0.2em" }}>
            CLICK A STAR TO EXPLORE
          </p>
        }
        title={
          <h1 className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow">
            MY GAALXY
          </h1>
        }
      >
        <div className="flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative z-10 mx-auto -mt-1 md:-mt-2"
            style={{
              width: "min(90vw, 1000px)",
              height: "min(66vh, 560px)",
            }}
          >
            {projects.map((project) => {
              const pos = getPos(project);
              const isHovered = hovered === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  className="absolute flex flex-col items-center group"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }}
                  onMouseEnter={() => setHovered(project.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => navigate(`/galaxy/project/${project.id}`)}
                >
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: isHovered ? 16 : 10,
                      height: isHovered ? 16 : 10,
                      background: "hsl(var(--foreground))",
                      boxShadow: isHovered
                        ? "0 0 20px 6px rgba(255,255,255,0.5), 0 0 40px 10px rgba(180,200,255,0.2)"
                        : "0 0 8px 2px rgba(255,255,255,0.3)",
                    }}
                  />
                  <span
                    className="text-foreground text-xs mt-2 transition-opacity duration-300 whitespace-nowrap"
                    style={{
                      opacity: isHovered ? 1 : 0.5,
                      letterSpacing: "0.1em",
                      fontSize: "0.65rem",
                      textShadow: "0 0 10px rgba(0,0,0,0.8)",
                    }}
                  >
                    {project.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CosmicStickyTitleLayout>

      <pre
        className="pointer-events-none fixed bottom-3 left-3 z-20 max-w-[min(100vw-1.25rem,380px)] overflow-x-auto font-mono text-[0.45rem] leading-[1.08] text-muted-foreground/80 [scrollbar-width:none] sm:bottom-4 sm:left-4 sm:text-[0.5rem] [&::-webkit-scrollbar]:hidden"
        style={{ textShadow: "0 0 10px hsl(var(--glow-color) / 0.12)" }}
        aria-hidden="true"
      >
        {galaxyTelescopeAscii.trimEnd()}
      </pre>
    </CosmicPageShell>
  );
};

export default Galaxy;

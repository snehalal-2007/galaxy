import { GraduationCap } from "lucide-react";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { CosmicStickyTitleLayout } from "@/components/CosmicStickyTitleLayout";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { education as ENTRIES } from "@/data/education";

type EducationProps = { /** Render without `CosmicPageShell` for the scroll journey. */ embed?: boolean };

const Education = ({ embed = false }: EducationProps) => {
  const body = (
    <CosmicStickyTitleLayout
      documentSection={embed}
      maxWidth="5xl"
      title={
        <h1 className="cosmic-page-title text-center font-bold uppercase text-foreground text-glow">
          EDUCATION
        </h1>
      }
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {ENTRIES.map((e, i) => (
          <Reveal
            key={e.id}
            as="article"
            delay={i * 90}
            repeat
            className="relative rounded-lg border border-border/80 bg-card/45 p-6 backdrop-blur-sm md:p-8"
            style={{ boxShadow: "0 0 24px rgba(40,55,80,0.12), inset 0 0 0 1px rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-start gap-4">
              {e.logo ? (
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border/70",
                    e.logoBg && "bg-white"
                  )}
                >
                  <img
                    src={e.logo}
                    alt={`${e.school} logo`}
                    className={cn("h-full w-full", e.logoBg ? "object-contain p-1.5" : "object-cover")}
                    loading="lazy"
                  />
                </span>
              ) : (
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/50 text-foreground">
                  <GraduationCap className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
                  <h2 className="text-foreground text-base font-bold uppercase tracking-[0.12em] md:text-lg">
                    {e.school}
                  </h2>
                  <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground md:pt-1 md:text-right">
                    {e.timeline}
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground md:text-base">{e.degree}</p>

                {e.gpa ? (
                  <span className="mt-3 inline-flex items-center gap-2 border border-border/80 bg-card/50 px-3 py-1 text-xs uppercase tracking-[0.15em] text-foreground">
                    GPA <span className="font-bold tracking-normal">{e.gpa}</span>
                  </span>
                ) : null}

                {e.details && e.details.length > 0 ? (
                  <ul className="mt-4 list-none space-y-2 p-0 text-sm leading-relaxed text-foreground/90">
                    {e.details.map((line) => (
                      <li
                        key={line}
                        className="relative pl-5 before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[rgb(95,115,150)] before:content-['']"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </CosmicStickyTitleLayout>
  );

  if (embed) return body;
  return <CosmicPageShell>{body}</CosmicPageShell>;
};

export default Education;

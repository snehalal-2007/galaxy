import { cn } from "@/lib/utils";

export type Experience = {
  title: string;
  organization: string;
  timeline: string;
  description: string[];
  skills: string[];
};

type MissionLogTimelineProps = {
  experiences: Experience[];
};

function TimelineNode({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 flex h-9 w-9 items-center justify-center",
        className
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "mission-log-node-core relative block h-3.5 w-3.5 rounded-full border-2 border-[rgb(90,110,145)]/85 bg-card/90 transition duration-300 ease-out",
          "group-hover/experience-row:animate-none group-hover/experience-row:scale-110",
          "group-hover/experience-row:border-[rgb(150,175,215)] group-hover/experience-row:bg-card",
          "group-hover/experience-row:shadow-[0_0_12px_rgba(110,145,200,0.65),0_0_28px_rgba(70,100,155,0.45)]"
        )}
      />
      <span
        className={cn(
          "mission-log-node-orbit-ring pointer-events-none absolute inset-0 rounded-full border border-dashed border-[rgb(75,90,118)]/45 opacity-70 transition duration-300",
          "group-hover/experience-row:border-[rgb(130,155,195)]/70 group-hover/experience-row:opacity-100"
        )}
      />
    </div>
  );
}

function ExperiencePanel({ exp, side }: { exp: Experience; side: "left" | "right" }) {
  const connector =
    side === "right"
      ? "after:absolute after:right-0 after:top-1/2 after:z-0 after:hidden after:h-px after:w-8 after:-translate-y-1/2 after:translate-x-full after:content-[''] after:md:block after:bg-gradient-to-r after:from-[rgb(72,92,128)]/75 after:to-transparent"
      : "after:absolute after:left-0 after:top-1/2 after:z-0 after:hidden after:h-px after:w-8 after:-translate-y-1/2 after:-translate-x-full after:content-[''] after:md:block after:bg-gradient-to-l after:from-[rgb(72,92,128)]/75 after:to-transparent";

  return (
    <article
      className={cn(
        "group/card relative w-full max-w-xl rounded-lg border border-border/80 bg-card/45 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.02] hover:border-foreground/30 hover:bg-card/65",
        "hover:shadow-[0_0_24px_rgba(45,62,92,0.22),0_0_48px_rgba(35,50,75,0.1)]",
        connector
      )}
      style={{
        boxShadow:
          "0 0 20px rgba(40,55,80,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <header className="space-y-1.5">
        <h2 className="text-foreground text-base font-bold uppercase tracking-[0.12em] md:text-lg">{exp.title}</h2>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]">
          {exp.organization}
        </p>
        <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em]">{exp.timeline}</p>
      </header>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 marker:text-[rgb(95,115,150)]">
        {exp.description.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
        {exp.skills.map((skill) => (
          <li key={skill}>
            <span
              className="inline-block border border-border/80 bg-background/35 px-3 py-1.5 text-xs tracking-wide text-foreground backdrop-blur-sm transition group-hover/card:border-foreground/35 group-hover/card:bg-background/50"
              style={{ letterSpacing: "0.06em" }}
            >
              {skill}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function MissionLogTimeline({ experiences }: MissionLogTimelineProps) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 12% 18%, rgba(130,145,170,0.35), transparent 55%)",
            "radial-gradient(1px 1px at 72% 42%, rgba(70,90,125,0.28), transparent 60%)",
            "radial-gradient(1px 1px at 38% 76%, rgba(120,135,160,0.22), transparent 55%)",
            "radial-gradient(1px 1px at 88% 12%, rgba(55,75,105,0.22), transparent 50%)",
            "radial-gradient(1px 1px at 54% 58%, rgba(100,115,140,0.18), transparent 50%)",
          ].join(", "),
        }}
      />

      <div
        className="pointer-events-none absolute bottom-0 left-[11px] top-0 w-px md:left-1/2 md:w-[2px] md:-translate-x-1/2"
        style={{
          background:
            "linear-gradient(180deg, rgba(42,55,78,0.25), rgba(52,68,95,0.75) 35%, rgba(62,82,118,0.92) 50%, rgba(52,68,95,0.75) 65%, rgba(42,55,78,0.25))",
          boxShadow:
            "0 0 10px rgba(38,52,78,0.35), 0 0 22px rgba(30,42,62,0.25), inset 0 0 1px rgba(90,110,145,0.15)",
        }}
        aria-hidden="true"
      />

      <ol className="relative z-10 m-0 list-none space-y-12 p-0 md:space-y-16">
        {experiences.map((exp, index) => {
          const isLeft = index % 2 === 0;
          const side = isLeft ? "right" : "left";

          return (
            <li
              key={`${exp.title}-${exp.organization}-${index}`}
              className="group/experience-row relative md:grid md:grid-cols-2 md:items-center md:gap-10"
            >
              <TimelineNode className="left-[11px] top-1/2 -translate-x-1/2 -translate-y-1/2 md:left-1/2 md:top-1/2" />

              <div
                className={cn(
                  "min-w-0 pl-10 pt-1 md:pl-0 md:pt-0",
                  isLeft ? "md:col-start-1 md:justify-self-end md:pr-10" : "md:col-start-2 md:justify-self-start md:pl-10"
                )}
              >
                <div className={cn(isLeft ? "md:ml-auto" : "md:mr-auto", "max-w-xl")}>
                  <ExperiencePanel exp={exp} side={side} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

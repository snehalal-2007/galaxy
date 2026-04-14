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
      <span className="mission-log-node-core relative block h-3.5 w-3.5 rounded-full border-2 border-primary/70 bg-card/90" />
      <span className="mission-log-node-orbit-ring pointer-events-none absolute inset-0 rounded-full border border-dashed border-foreground/20 opacity-60" />
    </div>
  );
}

function ExperiencePanel({ exp, side }: { exp: Experience; side: "left" | "right" }) {
  const connector =
    side === "right"
      ? "after:absolute after:right-0 after:top-8 after:z-0 after:hidden after:h-px after:w-8 after:translate-x-full after:content-[''] after:md:block after:bg-gradient-to-r after:from-primary/45 after:to-transparent"
      : "after:absolute after:left-0 after:top-8 after:z-0 after:hidden after:h-px after:w-8 after:-translate-x-full after:content-[''] after:md:block after:bg-gradient-to-l after:from-primary/45 after:to-transparent";

  return (
    <article
      className={cn(
        "group relative w-full max-w-xl rounded-lg border border-border/80 bg-card/45 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm transition duration-300 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.02] hover:border-foreground/30 hover:bg-card/65",
        "hover:shadow-[0_0_28px_hsl(var(--glow-color)/0.18),0_0_60px_hsl(var(--primary)/0.08)]",
        connector
      )}
      style={{
        boxShadow:
          "0 0 24px rgba(100,130,200,0.06), inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <header className="space-y-1.5">
        <h2 className="text-foreground text-base font-bold uppercase tracking-[0.12em] md:text-lg">{exp.title}</h2>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]">
          {exp.organization}
        </p>
        <p className="text-muted-foreground text-[0.65rem] uppercase tracking-[0.2em]">{exp.timeline}</p>
      </header>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90 marker:text-primary/80">
        {exp.description.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
        {exp.skills.map((skill) => (
          <li key={skill}>
            <span
              className="inline-block border border-border/80 bg-background/35 px-3 py-1.5 text-xs tracking-wide text-foreground backdrop-blur-sm transition group-hover:border-foreground/35 group-hover:bg-background/50"
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
            "radial-gradient(1px 1px at 12% 18%, hsl(var(--foreground) / 0.35), transparent 55%)",
            "radial-gradient(1px 1px at 72% 42%, hsl(var(--glow-color) / 0.25), transparent 60%)",
            "radial-gradient(1px 1px at 38% 76%, hsl(var(--foreground) / 0.22), transparent 55%)",
            "radial-gradient(1px 1px at 88% 12%, hsl(var(--primary) / 0.2), transparent 50%)",
            "radial-gradient(1px 1px at 54% 58%, hsl(var(--foreground) / 0.18), transparent 50%)",
          ].join(", "),
        }}
      />

      <div
        className="pointer-events-none absolute bottom-0 left-[11px] top-0 w-px md:left-1/2 md:w-[2px] md:-translate-x-1/2"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--glow-color) / 0.05), hsl(var(--glow-color) / 0.35) 45%, hsl(var(--primary) / 0.45) 55%, hsl(var(--glow-color) / 0.35), hsl(var(--glow-color) / 0.05))",
          boxShadow: "0 0 14px hsl(var(--glow-color) / 0.35), 0 0 28px hsl(var(--primary) / 0.12)",
        }}
        aria-hidden="true"
      />

      <ol className="relative z-10 m-0 list-none space-y-12 p-0 md:space-y-16">
        {experiences.map((exp, index) => {
          const isLeft = index % 2 === 0;
          const side = isLeft ? "right" : "left";

          return (
            <li key={`${exp.title}-${exp.organization}-${index}`} className="relative md:grid md:grid-cols-2 md:gap-10">
              <TimelineNode className="left-[11px] top-6 -translate-x-1/2 md:left-1/2 md:top-8 md:-translate-x-1/2" />

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

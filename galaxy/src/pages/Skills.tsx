import { useEffect, useMemo, useState } from "react";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { renderMoonAsciiForPhaseDegrees } from "@/lib/realisticSkillsMoonAscii";
import skillsData from "@/data/skills.json";

/**
 * ASCII grid size. `cols / rows` ≈ 1.65 so that with monospace cells (~taller than wide)
 * the lit disc reads closer to circular on screen (wider grids look like horizontal ovals).
 */
const MOON_ROWS = 36;
const MOON_COLS = 60;

type SkillItem = { label: string };
type SkillSectionRaw = { id: string; title: string; skills: SkillItem[] };
type MoonPhaseEntry = { id: string; label: string; phaseDeg: number; description?: string };

type SkillsDataFile = {
  moonPhaseCycle: MoonPhaseEntry[];
  sections: SkillSectionRaw[];
};

type SkillSection = SkillSectionRaw & {
  phaseDeg: number;
  phaseLabel: string;
};

const DATA = skillsData as SkillsDataFile;

function RealisticMoonAsciiBlock({ lines }: { lines: string[] | null }) {
  if (!lines) {
    return (
      <div
        className="inline-block select-none rounded-sm border border-border/40 bg-card/30"
        style={{
          width: "min(6.5rem, 22vw)",
          aspectRatio: "1 / 1",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <pre
      className="m-0 inline-block select-none text-left font-mono leading-none tracking-normal text-foreground/90"
      style={{
        fontSize: "clamp(1.65px, 0.34vw, 2.45px)",
        textShadow: "0 0 10px hsl(var(--glow-color) / 0.14)",
      }}
      aria-hidden="true"
    >
      {lines.join("\n")}
    </pre>
  );
}

const Skills = () => {
  const sectionsWithPhase = useMemo<SkillSection[]>(() => {
    const { moonPhaseCycle, sections } = DATA;
    const n = moonPhaseCycle.length;
    if (n === 0) return sections.map((s) => ({ ...s, phaseDeg: 180, phaseLabel: "Full Moon" }));

    return sections.map((section, index) => {
      const phase = moonPhaseCycle[index % n]!;
      return {
        ...section,
        phaseDeg: phase.phaseDeg,
        phaseLabel: phase.label,
      };
    });
  }, []);

  const [moonLinesById, setMoonLinesById] = useState<Record<string, string[] | null>>({});

  useEffect(() => {
    let cancelled = false;
    const ids = sectionsWithPhase.map((s) => s.id);
    const degrees = sectionsWithPhase.map((s) => s.phaseDeg);

    void (async () => {
      try {
        const frames = await renderMoonAsciiForPhaseDegrees(degrees, MOON_ROWS, MOON_COLS);
        if (cancelled) return;
        const next: Record<string, string[]> = {};
        ids.forEach((id, i) => {
          next[id] = frames[i] ?? [];
        });
        setMoonLinesById(next);
      } catch {
        if (!cancelled) setMoonLinesById({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sectionsWithPhase]);

  return (
    <CosmicPageShell>
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-24 md:pb-20 md:pt-28">
        <h1 className="cosmic-page-title text-foreground font-bold uppercase text-glow mb-8 text-center md:mb-10">
          SKILLS
        </h1>

        <div className="space-y-7 md:space-y-8">
          {sectionsWithPhase.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`skills-${section.id}-title`}
              className="grid grid-cols-1 items-start gap-5 border-b border-border/40 pb-7 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,148px)_1fr] md:items-center md:gap-8 md:pb-8"
            >
              <div className="flex justify-center md:justify-end md:pt-0.5">
                <RealisticMoonAsciiBlock lines={moonLinesById[section.id] ?? null} />
              </div>

              <div className="min-w-0 md:pl-6 lg:pl-10">
                <h2
                  id={`skills-${section.id}-title`}
                  className="text-foreground text-sm font-bold uppercase tracking-[0.2em] md:text-base"
                >
                  {section.title}
                </h2>
                <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {section.phaseLabel}
                </p>

                <ul className="mt-3 flex list-none flex-wrap gap-2 p-0 md:mt-3.5">
                  {section.skills.map((s) => (
                    <li key={s.label}>
                      <span
                        className="inline-block border border-border/80 bg-card/50 px-3 py-1.5 text-xs tracking-wide text-foreground backdrop-blur-sm transition hover:border-foreground/35 hover:bg-card/70"
                        style={{ letterSpacing: "0.06em" }}
                      >
                        {s.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </CosmicPageShell>
  );
};

export default Skills;

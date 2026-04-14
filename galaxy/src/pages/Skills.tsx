import { useMemo } from "react";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { generatePhaseMoonRaster, type MoonPhaseKind } from "@/lib/moonPhaseAscii";

/** Small grid; full disc + color phase shading. */
const MOON_ROWS = 16;
const MOON_COLS = 16;

type SkillSection = {
  id: string;
  title: string;
  phase: MoonPhaseKind;
  rotation: number;
  skills: { label: string }[];
};

const SECTIONS: SkillSection[] = [
  {
    id: "languages",
    title: "Languages",
    phase: "crescent",
    rotation: 0.35,
    skills: [
      { label: "Python" },
      { label: "Java" },
      { label: "C++ (learning)" },
      { label: "React" },
    ],
  },
  {
    id: "database",
    title: "Database",
    phase: "opposite",
    rotation: -0.28,
    skills: [{ label: "PostgreSQL" }, { label: "Supabase" }],
  },
  {
    id: "misc",
    title: "Miscellaneous",
    phase: "half",
    rotation: 0.12,
    skills: [{ label: "GitHub" }],
  },
];

function MoonAsciiBlock({ phase, rotation }: { phase: MoonPhaseKind; rotation: number }) {
  const raster = useMemo(
    () => generatePhaseMoonRaster(MOON_ROWS, MOON_COLS, phase, rotation),
    [phase, rotation]
  );

  return (
    <div
      className="inline-block select-none font-mono text-[0.34rem] leading-none sm:text-[0.4rem] md:text-[0.42rem]"
      style={{ textShadow: "0 0 10px hsl(var(--glow-color) / 0.14)" }}
      aria-hidden="true"
    >
      {raster.map((row, yi) => (
        <div key={yi} className="block whitespace-nowrap">
          {row.map((cell, xi) => (
            <span
              key={xi}
              className="inline-block w-[1ch] text-center align-top"
              style={{ color: cell.color }}
            >
              {cell.color === "transparent" ? "\u00a0" : cell.ch}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

const Skills = () => {
  return (
    <CosmicPageShell>
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-24 md:pb-20 md:pt-28">
        <h1 className="cosmic-page-title text-foreground font-bold uppercase text-glow text-center mb-8 md:mb-10">
          SKILLS
        </h1>

        <div className="space-y-7 md:space-y-8">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`skills-${section.id}-title`}
              className="grid grid-cols-1 items-start gap-5 border-b border-border/40 pb-7 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,132px)_1fr] md:items-center md:gap-6 md:pb-8"
            >
              <div className="flex justify-center md:justify-start md:pt-0.5">
                <MoonAsciiBlock phase={section.phase} rotation={section.rotation} />
              </div>

              <div className="min-w-0">
                <h2
                  id={`skills-${section.id}-title`}
                  className="text-foreground text-sm font-bold uppercase tracking-[0.2em] md:text-base"
                >
                  {section.title}
                </h2>
                <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {section.phase === "crescent" && "Crescent"}
                  {section.phase === "opposite" && "Opposite crescent"}
                  {section.phase === "half" && "Half moon"}
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

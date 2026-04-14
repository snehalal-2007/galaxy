import type { IconType } from "react-icons";
import { FaJava } from "react-icons/fa";
import {
  SiCplusplus,
  SiCss,
  SiGithub,
  SiHtml5,
  SiLinux,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSupabase,
  SiTypescript,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";

const iconClass = "h-[1.05rem] w-[1.05rem] shrink-0 md:h-[1.15rem] md:w-[1.15rem]";

type Entry = { Icon: IconType; color?: string };

/** Brand tints that stay readable on dark cosmic backgrounds. */
const SKILL_ICONS: Record<string, Entry> = {
  Python: { Icon: SiPython, color: "#3776AB" },
  Java: { Icon: FaJava, color: "#f89820" },
  TypeScript: { Icon: SiTypescript, color: "#3178c6" },
  "C++ (learning)": { Icon: SiCplusplus, color: "#659ad2" },
  React: { Icon: SiReact, color: "#61dafb" },
  HTML: { Icon: SiHtml5, color: "#e34f26" },
  CSS: { Icon: SiCss, color: "#1572b6" },
  PostgreSQL: { Icon: SiPostgresql, color: "#4169e1" },
  Supabase: { Icon: SiSupabase, color: "#3fcf8e" },
  GitHub: { Icon: SiGithub, color: "hsl(var(--foreground))" },
  "VS Code": { Icon: VscVscode, color: "#22a7f2" },
  "Linux basics": { Icon: SiLinux, color: "#fcc624" },
};

/** Renders brand icons for known `skills.json` labels (Simple Icons, Font Awesome Java, VS Code). */
export function SkillTechIcon({ label }: { label: string }) {
  const entry = SKILL_ICONS[label];
  if (!entry) return null;

  const { Icon, color } = entry;
  return <Icon className={iconClass} style={color ? { color } : undefined} aria-hidden />;
}

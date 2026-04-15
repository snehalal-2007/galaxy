import type { IconType } from "react-icons";
import { FaJava } from "react-icons/fa";
import { FaVolumeHigh } from "react-icons/fa6";
import {
  SiChartdotjs,
  SiCplusplus,
  SiCss,
  SiExpo,
  SiFramer,
  SiGithub,
  SiGoogle,
  SiGooglecloud,
  SiGooglegemini,
  SiHtml5,
  SiJavascript,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiWebgl,
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
  /** Project tech labels (`projects.json`) */
  Canvas: { Icon: SiHtml5, color: "#e34f26" },
  WebGL: { Icon: SiWebgl, color: "#990000" },
  JavaScript: { Icon: SiJavascript, color: "#f7df1e" },
  "Next.js": { Icon: SiNextdotjs, color: "hsl(var(--foreground))" },
  Tailwind: { Icon: SiTailwindcss, color: "#06b6d4" },
  "Tailwind CSS": { Icon: SiTailwindcss, color: "#06b6d4" },
  "Framer Motion": { Icon: SiFramer, color: "#0055ff" },
  Expo: { Icon: SiExpo, color: "#4630eb" },
  Reanimated: { Icon: SiReact, color: "#fa8d28" },
  "Audio API": { Icon: FaVolumeHigh, color: "#c4b5fd" },
  Finnhub: { Icon: SiChartdotjs, color: "#3cad55" },
  "Google Finance": { Icon: SiGoogle, color: "#4285F4" },
  MongoDB: { Icon: SiMongodb, color: "#47a248" },
  "Gemini API": { Icon: SiGooglegemini, color: "#8e75ff" },
  "Google Cloud Platform": { Icon: SiGooglecloud, color: "#4285F4" },
};

/** Renders brand icons for known `skills.json` and project tech labels. */
export function SkillTechIcon({ label }: { label: string }) {
  const entry = SKILL_ICONS[label];
  if (!entry) return null;

  const { Icon, color } = entry;
  return <Icon className={iconClass} style={color ? { color } : undefined} aria-hidden />;
}

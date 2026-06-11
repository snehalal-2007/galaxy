import { useEffect, useRef, useCallback, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { Button } from "@/components/ui/button";

// ASCII density chars from dark to light
const DENSITY = " .:-=+*#%@";

type MoonCell = { brightness: number; nx: number; ny: number };

/**
 * Mineral color inspired by true-color Moon photos: broad blue-gray western maria,
 * gold / honey north, rust–umber east and mid-basins. Stronger in dark mare,
 * plus a gentle whole-disk wash so bright terrain still reads tinted.
 */
function mineralTintRgb(nx: number, ny: number, brightness: number): [number, number, number] {
  const b = Math.max(0, Math.min(1, brightness));
  const mare = Math.pow(1 - b, 0.75);
  const mariaBoost = 0.35 + 0.92 * mare;
  const wash = 0.28 + 0.45 * (1 - b);

  // --- Sharp maria / basin color (follows darker albedo) ---
  const blueWest = Math.exp(-((nx - 0.12) ** 2 * 11 + (ny - 0.38) ** 2 * 8));
  const blueLowerRight = Math.exp(-((nx - 0.74) ** 2 * 14 + (ny - 0.68) ** 2 * 11));
  const blueSW = Math.exp(-((nx - 0.24) ** 2 * 7 + (ny - 0.76) ** 2 * 9)) * 0.7;
  const bluePeak = blueWest * 0.95 + blueLowerRight * 0.92 + blueSW;
  const blueMix = bluePeak * mariaBoost * 0.95;

  const goldNorth = Math.exp(-((nx - 0.36) ** 2 * 6 + (ny - 0.12) ** 2 * 14));
  const rustEast = Math.exp(-((nx - 0.78) ** 2 * 11 + (ny - 0.24) ** 2 * 10));
  const umberMid = Math.exp(-((nx - 0.56) ** 2 * 8 + (ny - 0.5) ** 2 * 7)) * 0.75;
  const warmPeak = goldNorth * 0.88 + rustEast * 0.98 + umberMid * 0.62;
  const warmMix = warmPeak * mariaBoost * 0.92;

  let dR = warmMix * 48 - blueMix * 14 + umberMid * mariaBoost * 22;
  let dG = warmMix * 28 - blueMix * 8 - umberMid * mariaBoost * 10;
  let dB = blueMix * 52 - warmMix * 12;

  // --- Broad, soft wash (visible on highlands too, like the reference photo) ---
  const coolHem = Math.exp(-((nx - 0.22) ** 2 * 4.5 + (ny - 0.48) ** 2 * 3.8));
  const warmHem = Math.exp(-((nx - 0.62) ** 2 * 4 + (ny - 0.32) ** 2 * 5.5));
  dR += warmHem * wash * 22;
  dG += warmHem * wash * 14 + coolHem * wash * 4;
  dB += coolHem * wash * 26 - warmHem * wash * 8;

  return [dR, dG, dB];
}

function moonCellAt(
  x: number,
  y: number,
  rows: number,
  cols: number,
  rotationRad: number
): MoonCell | null {
  const cx = cols / 2;
  const cy = rows / 2;
  const r = Math.min(cx, cy);
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);
  const dy = (y - cy) / r;
  const dx = (x - cx) / r;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 1) return null;

  const rdx = cos * dx - sin * dy;
  const rdy = sin * dx + cos * dy;

  const nz = Math.sqrt(Math.max(0, 1 - rdx * rdx - rdy * rdy));
  let brightness = Math.max(0, 0.3 * rdx + 0.2 * (-rdy) + 0.9 * nz);

  const nx = (rdx + 1) / 2;
  const ny = (rdy + 1) / 2;

  const imbriumDist = Math.sqrt((nx - 0.35) ** 2 + (ny - 0.25) ** 2);
  if (imbriumDist < 0.2) brightness *= 0.45 + 0.55 * (imbriumDist / 0.2);

  const serenitatisDist = Math.sqrt((nx - 0.6) ** 2 + (ny - 0.3) ** 2);
  if (serenitatisDist < 0.12) brightness *= 0.5 + 0.5 * (serenitatisDist / 0.12);

  const tranqDist = Math.sqrt((nx - 0.65) ** 2 + (ny - 0.48) ** 2);
  if (tranqDist < 0.14) brightness *= 0.45 + 0.55 * (tranqDist / 0.14);

  const crisiumDist = Math.sqrt((nx - 0.8) ** 2 + (ny - 0.38) ** 2);
  if (crisiumDist < 0.07) brightness *= 0.5 + 0.5 * (crisiumDist / 0.07);

  const nubiumDist = Math.sqrt((nx - 0.4) ** 2 + (ny - 0.65) ** 2);
  if (nubiumDist < 0.1) brightness *= 0.55 + 0.45 * (nubiumDist / 0.1);

  const fecDist = Math.sqrt((nx - 0.7) ** 2 + (ny - 0.55) ** 2);
  if (fecDist < 0.1) brightness *= 0.5 + 0.5 * (fecDist / 0.1);

  const procDist = Math.sqrt((nx - 0.25) ** 2 + (ny - 0.45) ** 2);
  if (procDist < 0.18) brightness *= 0.5 + 0.5 * (procDist / 0.18);

  const tychoDist = Math.sqrt((nx - 0.45) ** 2 + (ny - 0.78) ** 2);
  if (tychoDist < 0.03) brightness = Math.min(1, brightness + 0.5);
  const angle = Math.atan2(ny - 0.78, nx - 0.45);
  if (tychoDist < 0.25 && tychoDist > 0.03) {
    const rayPattern = Math.abs(Math.sin(angle * 7));
    if (rayPattern > 0.88) brightness = Math.min(1, brightness + 0.12 * (1 - tychoDist / 0.25));
  }

  const copDist = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.47) ** 2);
  if (copDist < 0.03) brightness = Math.min(1, brightness + 0.35);

  const noise =
    Math.sin(x * 13.7 + y * 7.3 + rotationRad * 8) * 0.04 +
    Math.sin(x * 5.1 + y * 11.9 - rotationRad * 5) * 0.03;
  brightness = Math.max(0, Math.min(1, brightness + noise));

  if (dist > 0.85) brightness *= (1 - dist) / 0.15;

  return { brightness, nx, ny };
}

const MOON_ASCII_ROWS = 80;
const MOON_ASCII_COLS = 80;

/** Radians per second for surface-feature drift (very slow libration) */
const MOON_TEXTURE_RAD_PER_SEC = 0.0065;

const MoonCanvas = ({ size }: { size: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const rad = angleRef.current;
    const rows = MOON_ASCII_ROWS;
    const cols = MOON_ASCII_COLS;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    const charH = size / rows;
    const charW = size / cols;
    const fontSize = Math.min(charH * 0.95, charW * 1.5);

    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = "top";

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = moonCellAt(col, row, rows, cols, rad);
        if (!cell) continue;
        const idx = Math.floor(cell.brightness * (DENSITY.length - 1));
        const ch = DENSITY[Math.min(DENSITY.length - 1, Math.max(0, idx))];
        if (ch === " ") continue;
        const alpha = 0.38 + cell.brightness * 0.62;
        const base = 188 + cell.brightness * 42;
        const [dr, dg, db] = mineralTintRgb(cell.nx, cell.ny, cell.brightness);
        const r = Math.max(0, Math.min(255, Math.round(base + dr)));
        const g = Math.max(0, Math.min(255, Math.round(base + dg)));
        const b = Math.max(0, Math.min(255, Math.round(base + db)));
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillText(ch, col * charW, row * charH);
      }
    }
    ctx.restore();
  }, [size]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      angleRef.current += MOON_TEXTURE_RAD_PER_SEC * dt;
      drawFrame();
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [drawFrame]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

/** Duration of the moon-expand launch before navigating to /about (ms). */
const LAUNCH_MS = 850;

type LaunchPhase = "enter" | "idle" | "launching";

const Index = () => {
  const [moonSize, setMoonSize] = useState(0);
  const [phase, setPhase] = useState<LaunchPhase>("enter");
  const [reduceMotion, setReduceMotion] = useState(false);
  const navigate = useNavigate();
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth * 0.8;
      const vh = window.innerHeight * 0.65;
      setMoonSize(Math.min(vw, vh, 500));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Honor reduced-motion; otherwise trigger the mount entrance on the next frame.
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce) {
      setReduceMotion(true);
      setPhase("idle");
      return;
    }
    const raf = requestAnimationFrame(() => setPhase("idle"));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(
    () => () => {
      if (launchTimer.current) clearTimeout(launchTimer.current);
    },
    []
  );

  const launch = () => {
    if (phase === "launching") return;
    if (reduceMotion) {
      navigate("/about");
      return;
    }
    setPhase("launching");
    launchTimer.current = setTimeout(() => navigate("/about"), LAUNCH_MS);
  };

  const entering = phase === "enter";
  const launching = phase === "launching";

  /** Title + button: rise + fade in on mount, quick fade out on launch. */
  const fadeRiseStyle = (delay: number): CSSProperties => ({
    opacity: entering || launching ? 0 : 1,
    transform: entering ? "translateY(14px)" : "translateY(0)",
    transition: launching
      ? "opacity 240ms ease-in"
      : "opacity 700ms ease-out, transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: launching ? "0ms" : `${delay}ms`,
  });

  return (
    <CosmicPageShell showNav={false} className="flex flex-col items-center justify-center">
      <h1
        className="cosmic-page-title text-foreground font-bold uppercase text-glow mb-8 md:mb-12"
        style={fadeRiseStyle(80)}
      >
        MY GALAXY
      </h1>

      <div
        className="relative z-10"
        style={{
          transformOrigin: "center center",
          transform: launching ? "scale(9)" : entering ? "scale(0.82)" : "scale(1)",
          opacity: launching || entering ? 0 : 1,
          transition: launching
            ? "transform 850ms cubic-bezier(0.6, 0, 0.85, 0.3), opacity 850ms ease-in"
            : "transform 950ms cubic-bezier(0.22, 1, 0.36, 1), opacity 950ms ease-out",
          transitionDelay: launching ? "0ms" : "180ms",
          willChange: "transform, opacity",
        }}
      >
        <MoonCanvas size={moonSize} />
      </div>

      <div
        className="relative z-10 mt-10 flex justify-center"
        style={{ ...fadeRiseStyle(360), pointerEvents: launching ? "none" : "auto" }}
      >
        <Button variant="cosmic" size="lg" onClick={launch}>
          Enter the galaxy
        </Button>
      </div>
    </CosmicPageShell>
  );
};

export default Index;

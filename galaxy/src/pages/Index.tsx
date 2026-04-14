import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CosmicPageShell } from "@/components/CosmicPageShell";
import { Button } from "@/components/ui/button";

// ASCII density chars from dark to light
const DENSITY = " .:-=+*#%@";

// Lunar surface brightness map (rows × cols); `rotationRad` slowly spins the lit texture on the disc
function generateMoonASCII(rows: number, cols: number, rotationRad: number): string[] {
  const lines: string[] = [];
  const cx = cols / 2;
  const cy = rows / 2;
  const r = Math.min(cx, cy);
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);

  for (let y = 0; y < rows; y++) {
    let line = "";
    const dy = (y - cy) / r;

    for (let x = 0; x < cols; x++) {
      const dx = (x - cx) / r;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        line += " ";
        continue;
      }

      // Rotate surface coordinates for slow libration-style drift of albedo features
      const rdx = cos * dx - sin * dy;
      const rdy = sin * dx + cos * dy;

      const nz = Math.sqrt(Math.max(0, 1 - rdx * rdx - rdy * rdy));
      let brightness = Math.max(0, 0.3 * rdx + 0.2 * (-rdy) + 0.9 * nz);

      const nx = (rdx + 1) / 2;
      const ny = (rdy + 1) / 2;

      // Mare Imbrium (upper-left)
      const imbriumDist = Math.sqrt((nx - 0.35) ** 2 + (ny - 0.25) ** 2);
      if (imbriumDist < 0.2) brightness *= 0.45 + 0.55 * (imbriumDist / 0.2);

      // Mare Serenitatis (upper-right of center)
      const serenitatisDist = Math.sqrt((nx - 0.6) ** 2 + (ny - 0.3) ** 2);
      if (serenitatisDist < 0.12) brightness *= 0.5 + 0.5 * (serenitatisDist / 0.12);

      // Mare Tranquillitatis (center-right)
      const tranqDist = Math.sqrt((nx - 0.65) ** 2 + (ny - 0.48) ** 2);
      if (tranqDist < 0.14) brightness *= 0.45 + 0.55 * (tranqDist / 0.14);

      // Mare Crisium (far right)
      const crisiumDist = Math.sqrt((nx - 0.8) ** 2 + (ny - 0.38) ** 2);
      if (crisiumDist < 0.07) brightness *= 0.5 + 0.5 * (crisiumDist / 0.07);

      // Mare Nubium (lower center-left)
      const nubiumDist = Math.sqrt((nx - 0.4) ** 2 + (ny - 0.65) ** 2);
      if (nubiumDist < 0.1) brightness *= 0.55 + 0.45 * (nubiumDist / 0.1);

      // Mare Fecunditatis (right of center-low)
      const fecDist = Math.sqrt((nx - 0.7) ** 2 + (ny - 0.55) ** 2);
      if (fecDist < 0.1) brightness *= 0.5 + 0.5 * (fecDist / 0.1);

      // Oceanus Procellarum (large, left side)
      const procDist = Math.sqrt((nx - 0.25) ** 2 + (ny - 0.45) ** 2);
      if (procDist < 0.18) brightness *= 0.5 + 0.5 * (procDist / 0.18);

      // Tycho crater (lower, bright with rays)
      const tychoDist = Math.sqrt((nx - 0.45) ** 2 + (ny - 0.78) ** 2);
      if (tychoDist < 0.03) brightness = Math.min(1, brightness + 0.5);
      const angle = Math.atan2(ny - 0.78, nx - 0.45);
      if (tychoDist < 0.25 && tychoDist > 0.03) {
        const rayPattern = Math.abs(Math.sin(angle * 7));
        if (rayPattern > 0.88) brightness = Math.min(1, brightness + 0.12 * (1 - tychoDist / 0.25));
      }

      // Copernicus crater
      const copDist = Math.sqrt((nx - 0.38) ** 2 + (ny - 0.47) ** 2);
      if (copDist < 0.03) brightness = Math.min(1, brightness + 0.35);

      // Texture noise (follow rotated cell indices for coherence)
      const noise =
        Math.sin(x * 13.7 + y * 7.3 + rotationRad * 8) * 0.04 +
        Math.sin(x * 5.1 + y * 11.9 - rotationRad * 5) * 0.03;
      brightness = Math.max(0, Math.min(1, brightness + noise));

      // Limb darkening (keep silhouette from unrotated disc)
      if (dist > 0.85) brightness *= (1 - dist) / 0.15;

      const idx = Math.floor(brightness * (DENSITY.length - 1));
      line += DENSITY[Math.min(DENSITY.length - 1, Math.max(0, idx))];
    }
    lines.push(line);
  }
  return lines;
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

    const asciiLines = generateMoonASCII(MOON_ASCII_ROWS, MOON_ASCII_COLS, angleRef.current);

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    const charH = size / MOON_ASCII_ROWS;
    const charW = size / MOON_ASCII_COLS;
    const fontSize = Math.min(charH * 0.95, charW * 1.5);

    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = "top";

    for (let row = 0; row < asciiLines.length; row++) {
      const line = asciiLines[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        if (ch === " ") continue;
        const brightness = DENSITY.indexOf(ch) / (DENSITY.length - 1);
        const alpha = 0.3 + brightness * 0.7;
        ctx.fillStyle = `rgba(220,220,230,${alpha})`;
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

const Index = () => {
  const [moonSize, setMoonSize] = useState(0);

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

  return (
    <CosmicPageShell showNav={false} className="flex flex-col items-center justify-center">
      <h1 className="cosmic-page-title text-foreground font-bold uppercase text-glow mb-8 md:mb-12">
        MY GALAXY
      </h1>

      <div className="relative z-10">
        <MoonCanvas size={moonSize} />
      </div>

      <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
        <Link to="/galaxy">
          <Button variant="cosmic" size="lg">
            Enter the Galaxy
          </Button>
        </Link>
        <Link to="/about">
          <Button variant="cosmic" size="lg">
            About
          </Button>
        </Link>
        <Link to="/skills">
          <Button variant="cosmic" size="lg">
            Skills
          </Button>
        </Link>
      </div>
    </CosmicPageShell>
  );
};

export default Index;

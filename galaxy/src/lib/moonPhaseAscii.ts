/** Same ramp as the home moon (`Index.tsx`). */
const DENSITY = " .:-=+*#%@";

/**
 * Monospace glyphs are taller than wide (~1.75×). Weight Y more in the rim test so the disc
 * reads circular on screen.
 */
const CELL_HEIGHT_OVER_WIDTH = 1.72;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0 || 1e-6)));
  return t * t * (3 - 2 * t);
}

/** Light albedo variation (simplified mare / texture). */
function surfaceMod(rdx: number, rdy: number): number {
  const nx = (rdx + 1) / 2;
  const ny = (rdy + 1) / 2;
  let m = 1;
  const imb = Math.hypot(nx - 0.35, ny - 0.28);
  if (imb < 0.18) m *= 0.55 + 0.45 * (imb / 0.18);
  const proc = Math.hypot(nx - 0.28, ny - 0.48);
  if (proc < 0.16) m *= 0.58 + 0.42 * (proc / 0.16);
  return m;
}

export type MoonPhaseKind = "crescent" | "opposite" | "half";

export type MoonCell = {
  /** Space outside the disc; non-breaking space can be used for layout */
  ch: string;
  /** CSS color (full disc uses color gradient; outside disc transparent) */
  color: string;
};

/**
 * Full circular ASCII moon: every cell inside the rim gets a glyph; phase is shown via
 * lightness / color (sunlit vs night side), not by hiding the disc.
 */
export function generatePhaseMoonRaster(
  rows: number,
  cols: number,
  phase: MoonPhaseKind,
  rotationRad = 0
): MoonCell[][] {
  const grid: MoonCell[][] = [];
  const cx = cols / 2;
  const cy = rows / 2;
  const r = Math.min(cx, cy);
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);

  let Lx: number;
  let Ly: number;
  let Lz: number;
  let gamma = 1;

  if (phase === "crescent") {
    Lx = 0.86;
    Ly = 0.06;
    Lz = 0.5;
    gamma = 2.05;
  } else if (phase === "opposite") {
    Lx = -0.86;
    Ly = -0.06;
    Lz = 0.5;
    gamma = 2.05;
  } else {
    Lx = 1;
    Ly = 0;
    Lz = 0.22;
    gamma = 1;
  }

  const invLen = 1 / Math.hypot(Lx, Ly, Lz);
  Lx *= invLen;
  Ly *= invLen;
  Lz *= invLen;

  for (let y = 0; y < rows; y++) {
    const row: MoonCell[] = [];
    const dy0 = (y - cy) / r;

    for (let x = 0; x < cols; x++) {
      const dx0 = (x - cx) / r;
      const rdx = cos * dx0 - sin * dy0;
      const rdy = sin * dx0 + cos * dy0;
      const dist = Math.hypot(rdx, rdy * CELL_HEIGHT_OVER_WIDTH);

      if (dist > 1) {
        row.push({ ch: " ", color: "transparent" });
        continue;
      }

      const nz = Math.sqrt(Math.max(0, 1 - rdx * rdx - rdy * rdy));
      const nx = rdx;
      const ny = rdy;

      let lambert = nx * Lx + ny * Ly + nz * Lz;

      let sunlit: number;
      if (phase === "half") {
        sunlit = smoothstep(-0.07, 0.07, nx);
      } else {
        lambert = Math.max(0, lambert);
        sunlit = Math.pow(lambert, gamma);
      }

      const noise =
        Math.sin(x * 13.7 + y * 7.3 + rotationRad * 6) * 0.04 +
        Math.sin(x * 5.1 + y * 11.9 - rotationRad * 4) * 0.03;

      const albedo = surfaceMod(rdx, rdy) * (0.88 + noise);
      /** Night side stays visible (“earthshine”); sunlit pushes toward 1 */
      let tone = 0.12 + 0.88 * sunlit * albedo;

      if (dist > 0.82) tone *= (1 - dist) / 0.18;

      tone = Math.max(0.08, Math.min(1, tone));

      const di = Math.floor(tone * (DENSITY.length - 1));
      const idx = Math.max(1, Math.min(DENSITY.length - 1, di));
      const ch = DENSITY[idx];

      const L = 10 + tone * 76;
      const S = 10 + sunlit * 16;
      const color = `hsl(226 ${S}% ${L}% / ${0.28 + tone * 0.72})`;

      row.push({ ch, color });
    }
    grid.push(row);
  }
  return grid;
}

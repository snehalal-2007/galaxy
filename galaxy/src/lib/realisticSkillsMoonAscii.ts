/** Same ramp as the user's HTML demo (realistic weighting). */
export const REALISTIC_MOON_CHARS = [" ", ".", ":", "-", "=", "i", "l", "w", "W", "#", "@"] as const;

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLunarTextureCanvas(rng: () => number): HTMLCanvasElement {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1024;
  textureCanvas.height = 512;
  const ctx = textureCanvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");

  ctx.fillStyle = "#222222";
  ctx.fillRect(0, 0, 1024, 512);

  for (let i = 0; i < 40000; i++) {
    const val = 30 + rng() * 20;
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(Math.floor(rng() * 1024), Math.floor(rng() * 512), 1, 1);
  }

  for (let i = 0; i < 10; i++) {
    const x = rng() * 1024;
    const y = rng() * 512;
    const r = 50 + rng() * 100;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, "rgba(20, 20, 20, 0.8)");
    grd.addColorStop(1, "rgba(30, 30, 30, 0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawRoughCrater = (x: number, y: number, radius: number, intensity: number) => {
    const segments = Math.floor(8 + radius * 0.5);
    const drawJitteredPath = (r: number, color: string) => {
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const jitter = 1 + (rng() - 0.5) * 0.2;
        const px = x + Math.cos(angle) * r * jitter;
        const py = y + Math.sin(angle) * r * jitter;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    drawJitteredPath(radius, `rgba(160, 160, 160, ${0.15 * intensity})`);
    drawJitteredPath(radius * 0.8, `rgba(10, 10, 10, ${0.4 * intensity})`);
  };

  for (let i = 0; i < 800; i++) drawRoughCrater(rng() * 1024, rng() * 512, 1 + rng() * 2, 0.4);
  for (let i = 0; i < 60; i++) drawRoughCrater(rng() * 1024, rng() * 512, 4 + rng() * 10, 0.7);
  for (let i = 0; i < 15; i++) drawRoughCrater(rng() * 1024, rng() * 512, 20 + rng() * 40, 1.0);

  return textureCanvas;
}

function setSunFromPhaseDeg(sunLight: import("three").DirectionalLight, phaseDeg: number) {
  const angle = (phaseDeg * Math.PI) / 180;
  const radius = 12;
  sunLight.position.set(Math.sin(angle) * radius, 0, -Math.cos(angle) * radius);
}

function readAsciiLines(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  cols: number,
  rows: number,
  chars: readonly string[]
): string[] {
  const pixels = new Uint8Array(cols * rows * 4);
  gl.readPixels(0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  const lines: string[] = [];
  for (let y = rows - 1; y >= 0; y--) {
    let row = "";
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
      const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
      row += chars[Math.min(chars.length - 1, Math.max(0, charIndex))];
    }
    lines.push(row);
  }
  return lines;
}

/**
 * Renders the same Three.js lunar sphere + lighting model as the user's demo, then samples
 * to ASCII lines. Seeded surface so the Skills page looks stable on every load.
 */
export async function renderMoonAsciiForPhaseDegrees(
  phaseDegrees: number[],
  rows: number,
  cols: number
): Promise<string[][]> {
  const THREE = await import("three");
  const rng = mulberry32(0x5f3759df);

  const scene = new THREE.Scene();
  /** Must match framebuffer pixel aspect (`cols / rows`) so the sphere projects as a circle in `readPixels`. */
  const camera = new THREE.PerspectiveCamera(35, cols / rows, 0.1, 1000);
  camera.position.z = 6;

  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    preserveDrawingBuffer: true,
    alpha: false,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(cols, rows, false);

  const textureCanvas = buildLunarTextureCanvas(rng);
  const texture = new THREE.CanvasTexture(textureCanvas);

  const geometry = new THREE.SphereGeometry(2, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: 0.18,
    roughness: 1.0,
  });
  const moon = new THREE.Mesh(geometry, material);
  moon.rotation.y = 1.8;
  moon.rotation.x = 0.2;
  scene.add(moon);

  scene.add(new THREE.AmbientLight(0xffffff, 0.01));
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
  scene.add(sunLight);

  const gl = renderer.getContext() as WebGLRenderingContext;
  const out: string[][] = [];

  try {
    for (const deg of phaseDegrees) {
      setSunFromPhaseDeg(sunLight, deg);
      renderer.render(scene, camera);
      out.push(readAsciiLines(gl, cols, rows, REALISTIC_MOON_CHARS));
    }
  } finally {
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
    canvas.remove();
  }

  return out;
}

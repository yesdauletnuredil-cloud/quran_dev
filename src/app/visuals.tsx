import { useMemo, useState } from "react";

// Visual registry: one entry per topic slug (see `topics` in data.ts).
// Patterns are generated SVG so reading rules / tajweed / letters stay abstract.
// To use a photo, set `image` (e.g. "/visuals/quran-stories.jpg"); the pattern
// remains the fallback if the file is missing or fails to load.

export type Pattern = "star" | "script" | "arcs" | "waves" | "grid";
export type VisualTone = "emerald" | "sage" | "sand" | "gold";
export interface Visual { pattern: Pattern; tone: VisualTone; glyph: string; image?: string }

export const lessonVisuals: Record<string, Visual> = {
  "learn-quran": { pattern: "script", tone: "emerald", glyph: "حُرُوف" },
  tajweed: { pattern: "star", tone: "emerald", glyph: "تَجْوِيد" },
  "quran-language": { pattern: "script", tone: "sage", glyph: "لِسَان" },
  tafsir: { pattern: "arcs", tone: "gold", glyph: "تَفْسِير" },
  "quran-sciences": { pattern: "star", tone: "sage", glyph: "عُلُوم" },
  "quran-stories": { pattern: "arcs", tone: "sand", glyph: "قَصَص" },
  "quran-history": { pattern: "grid", tone: "sand", glyph: "مُصْحَف" },
  memorization: { pattern: "waves", tone: "emerald", glyph: "حِفْظ" },
  reciters: { pattern: "waves", tone: "gold", glyph: "تِلَاوَة" },
  fiqh: { pattern: "grid", tone: "sage", glyph: "فِقْه" },
  aqidah: { pattern: "arcs", tone: "emerald", glyph: "إِيمَان" },
};
export const defaultVisual: Visual = { pattern: "star", tone: "emerald", glyph: "ٱقْرَأْ" };
export const questionVisual: Visual = { pattern: "grid", tone: "emerald", glyph: "سُؤَال" };
export const getVisual = (slug?: string): Visual => (slug && lessonVisuals[slug]) || defaultVisual;

const tones: Record<VisualTone, { from: string; to: string; line: string; glow: string }> = {
  emerald: { from: "#1a5a49", to: "#0b2f25", line: "#8ba89b", glow: "#e6a34c" },
  sage: { from: "#5b8172", to: "#2a463c", line: "#dfe9e3", glow: "#efe6d5" },
  sand: { from: "#7d6a4c", to: "#3b3124", line: "#efe6d5", glow: "#e6a34c" },
  gold: { from: "#9a5f17", to: "#4a2c09", line: "#f3cf91", glow: "#fff3dc" },
};

function patternBody(p: Pattern, w: number, h: number, line: string) {
  const stroke = (width = 1.4) => `fill="none" stroke="${line}" stroke-width="${width}" stroke-linecap="round"`;
  switch (p) {
    case "star":
      return `<pattern id="p" width="96" height="96" patternUnits="userSpaceOnUse"><g ${stroke()}><rect x="28" y="28" width="40" height="40"/><rect x="28" y="28" width="40" height="40" transform="rotate(45 48 48)"/><circle cx="48" cy="48" r="9"/><path d="M0 0L20 20M96 0L76 20M0 96L20 76M96 96L76 76M48 0v8M48 96v-8M0 48h8M96 48h-8"/></g></pattern><rect width="${w}" height="${h}" fill="url(#p)" opacity=".3"/>`;
    case "script":
      return `<pattern id="p" width="180" height="96" patternUnits="userSpaceOnUse"><g ${stroke(2)}><path d="M8 62q25-34 50 0t50 0M122 62h44M144 62v-34"/></g><g fill="${line}"><circle cx="33" cy="30" r="3.5"/><circle cx="83" cy="80" r="3.5"/><circle cx="138" cy="20" r="3.5"/><circle cx="150" cy="20" r="3.5"/></g></pattern><rect width="${w}" height="${h}" fill="url(#p)" opacity=".26"/>`;
    case "arcs": {
      const cx = w * 0.78;
      let d = "";
      for (let i = 0; i < 10; i++) {
        const half = 60 + i * 52, top = h - (half * 2.6);
        d += `<path d="M${cx - half} ${h}V${h - half * 1.3}Q${cx - half} ${top + half * 0.35} ${cx} ${top}Q${cx + half} ${top + half * 0.35} ${cx + half} ${h - half * 1.3}V${h}" opacity="${(1 - i * 0.07).toFixed(2)}"/>`;
      }
      return `<g ${stroke()} opacity=".34">${d}</g>`;
    }
    case "waves": {
      let d = "";
      const mid = h * 0.6;
      for (let x = 10; x < w; x += 16) {
        const a = ((Math.sin(x / 37) + Math.sin(x / 91) + 2) / 4) * h * 0.3 + 6;
        d += `M${x} ${(mid - a).toFixed(1)}V${(mid + a).toFixed(1)}`;
      }
      return `<path d="${d}" ${stroke(4)} opacity=".28"/>`;
    }
    case "grid":
      return `<pattern id="p" width="72" height="72" patternUnits="userSpaceOnUse"><g ${stroke()}><path d="M36 0L72 36L36 72L0 36Z"/><circle cx="36" cy="36" r="4"/></g></pattern><rect width="${w}" height="${h}" fill="url(#p)" opacity=".26"/>`;
  }
}

export function visualSvg(v: Visual, w: number, h: number) {
  const c = tones[v.tone];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.from}"/><stop offset="1" stop-color="${c.to}"/></linearGradient><radialGradient id="glow" cx=".78" cy=".3" r=".6"><stop offset="0" stop-color="${c.glow}" stop-opacity=".22"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)"/>${patternBody(v.pattern, w, h, c.line)}<rect width="${w}" height="${h}" fill="url(#glow)"/></svg>`;
}

export const visualUrl = (v: Visual, w: number, h: number) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(visualSvg(v, w, h))}`;

/** Background layer: photo (if set) → generated pattern fallback, plus a readability gradient. */
export function VisualBackdrop({ visual, glyph = true }: { visual: Visual; glyph?: boolean }) {
  const [failed, setFailed] = useState(false);
  const pattern = useMemo(() => visualUrl(visual, 1600, 900), [visual]);
  const src = visual.image && !failed ? visual.image : pattern;
  return (
    <div aria-hidden="true" className="visual-backdrop" data-tone={visual.tone}>
      <img alt="" onError={() => setFailed(true)} src={src} />
      <div className="visual-overlay" />
      {glyph && <span className="visual-glyph arabic" lang="ar">{visual.glyph}</span>}
    </div>
  );
}

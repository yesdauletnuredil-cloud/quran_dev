import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site, withBase } from "./config";
import { useApp } from "./context";
import { Button, Icon } from "./ui";
import { visualUrl, type Visual } from "./visuals";
import logoMark from "../assets/logo-mark.png";

// Stories card export. There is no web API for posting to Instagram directly:
// we render a 1080×1920 PNG, then offer download or the system share sheet.

export interface StoryData {
  eyebrow: string;
  title: string;
  subtitle?: string;
  visual: Visual;
  path: string;
  /** Text inside a medal instead of the Arabic glyph (achievements) */
  medal?: string;
  demo?: boolean;
}

const W = 1080, H = 1920;
const SANS = '"Lexend", "Helvetica Neue", Arial, sans-serif';

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s*\S*$/, "")}…`; }
  return lines;
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, fill: string, color: string, size = 34) {
  ctx.font = `500 ${size}px ${SANS}`;
  const w = ctx.measureText(text).width + size * 1.6, h = size * 2;
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + size * 0.8, y + h / 2 + 2);
  return w;
}

export async function drawStory(data: StoryData) {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  await Promise.all([
    document.fonts.load(`400 300px "Amiri Quran"`, data.visual.glyph),
    document.fonts.load(`400 80px Lexend`),
    document.fonts.load(`500 34px Lexend`),
  ]).catch(() => undefined);

  // Background: photo if available, generated pattern otherwise.
  let bg: HTMLImageElement;
  try { bg = await loadImage(data.visual.image ? withBase(data.visual.image) : visualUrl(data.visual, W, H)); } catch { bg = await loadImage(visualUrl(data.visual, W, H)); }
  const scale = Math.max(W / bg.width, H / bg.height);
  ctx.drawImage(bg, (W - bg.width * scale) / 2, (H - bg.height * scale) / 2, bg.width * scale, bg.height * scale);
  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(7,26,20,.35)");
  shade.addColorStop(0.45, "rgba(7,26,20,.35)");
  shade.addColorStop(1, "rgba(7,26,20,.94)");
  ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);

  // Brand: logo emblem + name
  const emblem = await loadImage(logoMark);
  const eh = 108, ew = emblem.width * eh / emblem.height;
  ctx.drawImage(emblem, 80, 96, ew, eh);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left"; ctx.font = `500 34px ${SANS}`; ctx.fillStyle = "#f7f5ed";
  const tx = 80 + ew + 22;
  ctx.fillText("QURAN", tx, 130);
  ctx.fillText("ACADEMY", tx, 174);
  ctx.fillStyle = "#e6a34c"; ctx.fillText("KZ", tx + 10 + ctx.measureText("ACADEMY").width, 174);
  if (data.demo) {
    ctx.font = `600 28px ${SANS}`;
    const w = ctx.measureText("DEMO").width + 44;
    pill(ctx, W - 80 - w, 106, "DEMO", "#d97706", "#fff", 28);
  }

  // Center: Arabic glyph or achievement medal
  ctx.textAlign = "center";
  if (data.medal) {
    const cx = W / 2, cy = 720;
    ctx.strokeStyle = "rgba(230,163,76,.45)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 270, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#e6a34c";
    ctx.beginPath(); ctx.arc(cx, cy, 220, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0d3a2e";
    ctx.beginPath(); ctx.arc(cx, cy, 196, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f7f5ed"; ctx.font = `400 ${data.medal.length > 3 ? 120 : 190}px ${SANS}`; ctx.textBaseline = "middle";
    ctx.fillText(data.medal, cx, cy + 8);
  } else {
    ctx.direction = "rtl";
    ctx.fillStyle = "rgba(247,245,237,.88)"; ctx.font = `400 300px "Amiri Quran", serif`; ctx.textBaseline = "middle";
    ctx.fillText(data.visual.glyph, W / 2, 700);
    ctx.direction = "ltr";
  }

  // Text block, anchored to the bottom
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.font = `400 84px ${SANS}`;
  const lines = wrap(ctx, data.title, W - 160, 4);
  ctx.font = `400 38px ${SANS}`;
  const sub = data.subtitle ? wrap(ctx, data.subtitle, W - 160, 3) : [];
  let y = 1660 - sub.length * 54 - (sub.length ? 30 : 0) - lines.length * 96;
  ctx.font = `600 30px ${SANS}`; ctx.fillStyle = "#e6a34c";
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "5px";
  ctx.fillText(data.eyebrow.toUpperCase(), 80, y - 40);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  ctx.font = `400 84px ${SANS}`; ctx.fillStyle = "#ffffff";
  for (const l of lines) { y += 96; ctx.fillText(l, 80, y); }
  if (sub.length) {
    y += 30;
    ctx.font = `400 38px ${SANS}`; ctx.fillStyle = "#d3e0da";
    for (const l of sub) { y += 54; ctx.fillText(l, 80, y); }
  }
  pill(ctx, 80, 1730, `${site.domain}${data.path}`, "rgba(247,245,237,.14)", "#f7f5ed");

  return canvas;
}

export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const area = document.createElement("textarea");
    area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
    document.body.appendChild(area); area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function StoryModal({ data, onClose }: { data: StoryData; onClose: () => void }) {
  const { t, notify } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [failed, setFailed] = useState(false);
  const filename = `quran-academy-story-${data.path.split("/").filter(Boolean).join("-") || "card"}.png`;
  // Parents rebuild `data` on every render; redraw only when its content changes.
  const dataKey = JSON.stringify(data);

  useEffect(() => {
    let alive = true;
    drawStory(JSON.parse(dataKey) as StoryData).then((canvas) => {
      if (!alive) return;
      setPreview(canvas.toDataURL("image/png"));
      canvas.toBlob((b) => alive && b && setFile(new File([b], filename, { type: "image/png" })), "image/png");
    }).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [dataKey, filename]);

  // Keyboard focus: move into the dialog on open, keep Tab inside, give it back to the opener on close.
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => { if (opener?.isConnected) opener.focus(); };
  }, []);
  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    const inside = dialogRef.current.contains(document.activeElement);
    if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const download = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview; a.download = filename; a.click();
  };

  const share = async () => {
    if (file && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: data.title }); } catch { /* user cancelled */ }
      return;
    }
    download();
    notify(t("Сурет сақталды. Instagram-да Stories-ке өзіңіз қосыңыз.", "Картинка сохранена. Добавьте её в Stories в Instagram."));
  };

  // Rendered at the app root: inside the sticky side column the dialog could not rise above the
  // site header. `.app` (not body) keeps the light/dark theme variables.
  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div aria-labelledby="story-title" aria-modal="true" className="auth-modal story-modal" onKeyDown={trapTab} onMouseDown={(e) => e.stopPropagation()} ref={dialogRef} role="dialog">
        <button aria-label={t("Жабу", "Закрыть")} className="modal-close icon-button" onClick={onClose} ref={closeRef} type="button"><Icon name="close" /></button>
        <div className="story-preview">
          {preview ? <img alt={t("Stories карточкасының алдын ала көрінісі", "Предпросмотр карточки для Stories")} src={preview} />
            : <span className="story-placeholder">{failed ? t("Карточканы жасау мүмкін болмады", "Не удалось создать карточку") : <i aria-hidden="true" className="spinner" />}</span>}
        </div>
        <div className="story-side">
          <h2 id="story-title">{t("Stories карточкасы", "Карточка для Stories")}</h2>
          <p>{t("Суретті сақтап немесе телефонның «Бөлісу» мәзірі арқылы жіберіп, Instagram-да Stories-ке қосыңыз. Сайт Instagram-ға өзі жарияламайды.", "Сохраните картинку или отправьте через меню «Поделиться» телефона и добавьте в Stories в Instagram. Сайт не публикует в Instagram сам.")}</p>
          <div className="story-actions">
            <Button disabled={!file} full icon="share" onClick={share}>{t("Бөлісу", "Поделиться")}</Button>
            <Button disabled={!preview} full icon="download" onClick={download} variant="secondary">{t("PNG жүктеу", "Скачать PNG")}</Button>
          </div>
          {data.demo && <p className="story-demo">{t("DEMO: жетістік деректері үлгі ретінде көрсетілген.", "DEMO: данные достижения показаны для примера.")}</p>}
        </div>
      </div>
    </div>,
    document.querySelector(".app") ?? document.body,
  );
}

/** Share panel for lesson / course / question pages. */
export function SharePanel({ title, path, story }: { title: string; path: string; story: StoryData }) {
  const { t, notify } = useApp();
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}${withBase(path)}`;

  const copy = async () => notify(await copyText(url) ? t("Сілтеме көшірілді", "Ссылка скопирована") : t("Көшіру мүмкін болмады", "Не удалось скопировать"));
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* user cancelled */ }
    } else copy();
  };

  return (
    <div className="panel share-panel">
      <h3>{t("Бөлісу", "Поделиться")}</h3>
      <div className="share-actions">
        <Button icon="share" onClick={share} size="sm" variant="secondary">{t("Бөлісу", "Поделиться")}</Button>
        <Button icon="copy" onClick={copy} size="sm" variant="secondary">{t("Сілтеме", "Ссылка")}</Button>
      </div>
      <button className="story-trigger" onClick={() => setOpen(true)} type="button">
        <span className="story-trigger-thumb" style={{ backgroundImage: `url("${visualUrl(story.visual, 90, 160)}")` }} />
        <span><b>{t("Stories карточкасы", "Карточка для Stories")}</b><small>PNG 1080×1920</small></span>
        <Icon name="chevron" size={18} />
      </button>
      {open && <StoryModal data={story} onClose={() => setOpen(false)} />}
    </div>
  );
}

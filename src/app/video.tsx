import { useEffect, useRef, useState } from "react";
import { useApp } from "./context";
import { Icon } from "./ui";
import { VisualBackdrop, type Visual } from "./visuals";

// UI placeholder for the lesson video. Playback is simulated with a timer
// (same approach as the podcast player); swap the stage for a <video> later.

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// No visible caption: the lesson title is already the page heading right above the player.
export default function LessonVideo({ visual, title, minutes }: { visual: Visual; title: string; minutes: number }) {
  const { t } = useApp();
  const total = minutes * 60;
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [muted, setMuted] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setPos((p) => (p + 1 >= total ? (setPlaying(false), 0) : p + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else stage.current?.requestFullscreen?.().catch(() => undefined);
  };
  const playLabel = playing ? t("Тоқтату", "Пауза") : t("Ойнату", "Воспроизвести");

  return (
    <figure aria-label={`${t("Сабақ бейнесі", "Видео урока")}: ${title}`} className={`video-player ${playing ? "is-playing" : ""}`}>
      <div className="video-stage" ref={stage}>
        <VisualBackdrop glyph={false} visual={visual} />
        <span className="video-badge">DEMO · {t("бейне жақында", "видео скоро")}</span>
        <button aria-label={playLabel} className="video-play" onClick={() => setPlaying(!playing)} type="button">
          <Icon name={playing ? "pause" : "play"} size={30} />
        </button>
        <div className="video-controls">
          <button aria-label={playLabel} onClick={() => setPlaying(!playing)} type="button"><Icon name={playing ? "pause" : "play"} size={18} /></button>
          <span className="video-time">{fmt(pos)} / {fmt(total)}</span>
          <input aria-label={t("Орын", "Позиция")} aria-valuetext={fmt(pos)} className="video-progress" max={total} min={0} onChange={(e) => setPos(Number(e.target.value))} style={{ "--p": `${(pos / total) * 100}%` } as React.CSSProperties} type="range" value={pos} />
          <button aria-label={muted ? t("Дыбысты қосу", "Включить звук") : t("Дыбысты өшіру", "Выключить звук")} aria-pressed={muted} onClick={() => setMuted(!muted)} type="button"><Icon name={muted ? "mute" : "volume"} size={18} /></button>
          <button aria-label={t("Толық экран", "Полный экран")} onClick={fullscreen} type="button"><Icon name="expand" size={18} /></button>
        </div>
      </div>
    </figure>
  );
}

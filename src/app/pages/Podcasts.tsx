import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useApp } from "../context";
import { episodes, getEpisode } from "../data";
import { Chips, Icon, PageHero } from "../ui";
import { NotFoundBlock } from "./Quran";

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function Podcasts() {
  const { t } = useApp();
  const all = t("Барлығы", "Все");
  const [type, setType] = useState(all);
  const shown = episodes.filter((e) => type === all || e.type === type);
  const [first, ...rest] = shown;
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Подкасттар", "Подкасты") }]}
        eyebrow={t("МЕДИА", "МЕДИА")}
        lead={t("Жолда, үйде немесе бос уақытыңызда пайдалы білім алыңыз.", "Получайте полезные знания в дороге, дома или в свободное время.")}
        title={t("Тыңдаңыз. Көріңіз. Үйреніңіз.", "Слушайте. Смотрите. Учитесь.")}
      />
      <section className="page-section">
        <div className="container">
          <Chips items={[all, "Podcast", "Video", "Audio"]} onChange={setType} value={type} />
          <div className="media-grid">
            {first && <MediaCard className="media-card-1" ep={first} />}
            {rest.map((ep, i) => <MediaCard className={`media-card-${(i % 2) + 2}`} ep={ep} key={ep.id} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function MediaCard({ ep, className }: { ep: (typeof episodes)[0]; className: string }) {
  return (
    <Link className={`media-card ${className}`} to={`/podcasts/${ep.id}`}>
      <div className="media-top"><span>{ep.type}</span><span>{ep.duration}</span></div>
      <div className="media-bottom">
        <span className="media-play"><Icon name="play" /></span>
        <div><h3>{ep.title}</h3><p>{ep.host}</p></div>
      </div>
    </Link>
  );
}

export function EpisodePage() {
  const { id } = useParams();
  const ep = getEpisode(id);
  const { t } = useApp();
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (!playing || !ep) return;
    const timer = window.setInterval(() => setPos((p) => (p + 1 >= ep.seconds ? (setPlaying(false), 0) : p + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, ep]);

  if (!ep) return <NotFoundBlock />;
  const next = episodes.filter((e) => e.id !== ep.id).slice(0, 3);
  return (
    <>
      <PageHero
        crumbs={[{ label: t("Басты бет", "Главная"), to: "/" }, { label: t("Подкасттар", "Подкасты"), to: "/podcasts" }, { label: ep.title }]}
        eyebrow={`${ep.type.toUpperCase()} · ${ep.date.toUpperCase()}`}
        lead={`${ep.host} · ${ep.duration}`}
        title={ep.title}
      />
      <section className="page-section">
        <div className="container detail-layout">
          <div className="detail-main">
            <div className="player">
              <button aria-label={playing ? t("Тоқтату", "Пауза") : t("Ойнату", "Воспроизвести")} className="player-button" onClick={() => setPlaying(!playing)} type="button"><Icon name={playing ? "pause" : "play"} size={26} /></button>
              <div className="player-track">
                <input aria-label={t("Орын", "Позиция")} max={ep.seconds} min={0} onChange={(e) => setPos(Number(e.target.value))} type="range" value={pos} />
                <div><span>{fmt(pos)}</span><span>{ep.duration}</span></div>
              </div>
            </div>
            <div className="prose">
              <p>{ep.desc}</p>
              <h3>{t("Бұл шығарылымда", "В этом выпуске")}</h3>
              <ul>{ep.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          </div>
          <aside className="detail-aside">
            <div className="panel">
              <h3>{t("Басқа шығарылымдар", "Другие выпуски")}</h3>
              <div className="mini-list">
                {next.map((e) => <Link key={e.id} to={`/podcasts/${e.id}`}><span>{e.type}</span>{e.title}</Link>)}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

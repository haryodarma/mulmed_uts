"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  cultures,
  getInstrument,
  instruments,
  type Culture,
  type Instrument,
  type InstrumentId,
} from "@/content/instruments";
import { playDemo, playPart } from "@/lib/audio/engine";
import { InstrumentArt } from "@/components/ui/InstrumentArt";

const StageCanvas = dynamic(() => import("@/components/scene/StageCanvas"), {
  ssr: false,
  loading: () => (
    <div className="stage-loading stage-loading-standalone" aria-hidden="true">
      <span />
    </div>
  ),
});

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<InstrumentId>("gendang");
  const [playing, setPlaying] = useState(false);
  const [ensemble, setEnsemble] = useState(false);
  const [filter, setFilter] = useState<Culture | "Semua">("Semua");
  const ensembleTimers = useRef<number[]>([]);
  const stopDemo = useRef<(() => void) | null>(null);

  const selected =
    instruments.find((instrument) => instrument.id === selectedId) ??
    instruments[0];
  const selectedIndex = instruments.findIndex(
    (instrument) => instrument.id === selected.id,
  );
  const instrumentCount = String(instruments.length).padStart(2, "0");
  const visible =
    filter === "Semua"
      ? instruments
      : instruments.filter((item) => item.culture === filter);

  useEffect(() => {
    return () => {
      ensembleTimers.current.forEach((timer) => window.clearTimeout(timer));
      stopDemo.current?.();
    };
  }, []);

  function selectInstrument(item: Instrument) {
    stopDemo.current?.();
    stopDemo.current = null;
    setSelectedId(item.id);
    setPlaying(false);
  }

  function playSelected() {
    stopDemo.current?.();
    stopDemo.current = playDemo(selected.id, () => {
      stopDemo.current = null;
      setPlaying(false);
    });
    setPlaying(stopDemo.current !== null);
  }

  function toggleEnsemble() {
    setEnsemble((current) => {
      const next = !current;

      ensembleTimers.current.forEach((timer) => window.clearTimeout(timer));
      ensembleTimers.current = [];

      if (next) {
        instruments.slice(0, 3).forEach((item, index) => {
          const timer = window.setTimeout(
            () => playPart(item.id, item.parts[0].id),
            index * 280,
          );
          ensembleTimers.current.push(timer);
        });
      }

      return next;
    });
  }

  function exploreCulture(culture: Culture) {
    setFilter(culture);
    const first = instruments.find((instrument) => instrument.culture === culture);
    if (first) selectInstrument(first);

    document.getElementById("jelajah")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  function showInStage() {
    document.getElementById("home")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#home">
          <span className="brand-mark">ST</span>
          <span>
            SUARA TANAH <b>NTB</b>
          </span>
        </a>
        <div className="nav-links">
          <a href="#jelajah">Jelajahi</a>
          <a href="#cerita">Tentang</a>
          <a className="nav-cta" href="#jelajah">
            Mulai mendengar <span>↗</span>
          </a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> ARSIP BUNYI NUSA TENGGARA BARAT
          </div>
          <h1>
            Setiap bunyi
            <br />
            punya <em>cerita.</em>
          </h1>
          <p>
            Temui alat musik tradisional Sasak, Samawa, dan Mbojo lewat
            pengalaman yang bisa kamu lihat, dengar, dan jelajahi.
          </p>
          <a className="primary-button" href="#jelajah">
            Jelajahi koleksi <span>↓</span>
          </a>
          <div className="hero-foot">
            <span>{instrumentCount} ALAT MUSIK</span>
            <span className="foot-line" />
            <span>03 BUDAYA</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-a" />
          <div className="hero-orbit orbit-b" />
          <div className="hero-sun" />
          <StageCanvas selectedId={selected.id} onSelect={(id) => selectInstrument(getInstrument(id))} />
          <div className="hero-label">
            <span>{String(selectedIndex + 1).padStart(2, "0")} / {instrumentCount}</span>
            <strong>{selected.name}</strong>
            <small>
              {selected.culture.toUpperCase()} · {selected.place.toUpperCase()}
            </small>
          </div>
          <span className="hero-coordinate">
            8° 39′ S
            <br />
            116° 20′ E
          </span>
        </div>

        <div className="hero-bottom">
          <span>GULIR UNTUK MENJELAJAH</span>
          <div className="scroll-mark">↓</div>
          <span>LOMBOK — SUMBAWA — BIMA</span>
        </div>
      </section>

      <section className="intro-strip" id="cerita">
        <p>
          <span className="section-index">01 — PENGANTAR</span>
          <strong>Warisan yang hidup dalam irama.</strong>
        </p>
        <p className="intro-description">
          Dari dentum gendang di Lombok hingga tiupan silu di Bima, musik
          tradisional NTB menyimpan kisah tentang kebersamaan, perayaan, dan
          identitas.
        </p>
      </section>

      <section className="explore" id="jelajah">
        <div className="section-heading">
          <div>
            <span className="section-index">02 — KOLEKSI PILIHAN</span>
            <h2>Dengar lebih dekat.</h2>
          </div>
          <div className="heading-note">
            PILIH ALAT MUSIK
            <br />
            UNTUK MEMULAI
          </div>
        </div>

        <div className="collection-layout">
          <aside className="collection-side">
            <span className="side-label">ASAL BUDAYA</span>
            {cultures.map((culture) => (
              <button
                key={culture}
                className={`filter-button${filter === culture ? " selected" : ""}`}
                onClick={() => setFilter(culture)}
              >
                {culture}
                <span>
                  {culture === "Semua"
                    ? instrumentCount
                    : String(
                        instruments.filter((item) => item.culture === culture)
                          .length,
                      ).padStart(2, "0")}
                </span>
              </button>
            ))}
            <div className="side-note">
              Tiga budaya, satu ruang untuk merayakan bunyi.
            </div>
          </aside>

          <div className="collection-main">
            <div className="selected-card">
              <div className="selected-art">
                <InstrumentArt instrument={selected} active={playing} />
                <span className="art-caption">
                  ILUSTRASI INTERAKTIF <i>✳</i>
                </span>
              </div>
              <div className="selected-info">
                <div className="selected-meta">
                  <span>
                    {selected.culture.toUpperCase()} ·{" "}
                    {selected.place.toUpperCase()}
                  </span>
                  <span>
                    NO. {String(selectedIndex + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{selected.name}</h3>
                <p className="selected-note">{selected.note}</p>
                <p className="selected-detail">{selected.detail}</p>
                {selected.documentation && (
                  <div className="instrument-documentation">
                    <dl>
                      <dt>Nama lain</dt>
                      <dd>{selected.documentation.aliases}</dd>
                      <dt>Asal dan sebaran</dt>
                      <dd>{selected.documentation.origin}</dd>
                      <dt>Cara memainkan</dt>
                      <dd>{selected.documentation.playing}</dd>
                      <dt>Bahan utama</dt>
                      <dd>{selected.documentation.materials}</dd>
                    </dl>
                    <details>
                      <summary>Foto dan referensi</summary>
                      <ul>
                        {selected.documentation.sources.map(({ label, url }) => (
                          <li key={url}><a href={url}>{label}</a></li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
                <div className="selected-tags">
                  <span>{selected.kind}</span>
                  <span>Tradisi {selected.culture}</span>
                  <span>Suara simulasi</span>
                </div>
                <div className="selected-actions">
                  <button
                    className={`play-button${playing ? " playing" : ""}`}
                    onClick={playSelected}
                    aria-label={`${playing ? "Mainkan ulang" : "Dengarkan simulasi suara"} ${selected.name}`}
                  >
                    <span>{playing ? "Ⅱ" : "▶"}</span>
                    {playing ? "Sedang dimainkan" : "Dengarkan simulasi suara"}
                    <b>↗</b>
                  </button>
                  <button
                    type="button"
                    className="stage-link"
                    onClick={showInStage}
                  >
                    Lihat di panggung 3D ↑
                  </button>
                </div>
              </div>
            </div>

            <div className="instrument-list">
              {visible.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectInstrument(item)}
                  className={`instrument-row${selected.id === item.id ? " active" : ""}`}
                >
                  <span className="row-number">
                    {String(instruments.indexOf(item) + 1).padStart(2, "0")}
                  </span>
                  <span className="row-symbol">{item.emoji}</span>
                  <span className="row-title">
                    <strong>{item.name}</strong>
                    <small>
                      {item.culture} · {item.place}
                    </small>
                  </span>
                  <span className="row-kind">{item.kind}</span>
                  <span className="row-arrow">↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="region-section" id="wilayah">
        <div className="region-heading">
          <span className="section-index">03 — PETA BUDAYA</span>
          <h2>
            Tiga wilayah,
            <br />
            <em>satu gugus bunyi.</em>
          </h2>
          <p>
            Pilih wilayah untuk menjelajahi alat musik dan tradisi yang terkait.
          </p>
        </div>

        <div className="region-map" aria-label="Pilih wilayah budaya NTB">
          <div className="map-contour contour-one" />
          <div className="map-contour contour-two" />
          <div className="island island-lombok" />
          <div className="island island-sumbawa" />
          <div className="island island-bima" />
          <button
            className="map-point point-sasak"
            onClick={() => exploreCulture("Sasak")}
          >
            <i />
            <span>
              SASAK
              <small>LOMBOK</small>
            </span>
          </button>
          <button
            className="map-point point-samawa"
            onClick={() => exploreCulture("Samawa")}
          >
            <i />
            <span>
              SAMAWA
              <small>SUMBAWA</small>
            </span>
          </button>
          <button
            className="map-point point-mbojo"
            onClick={() => exploreCulture("Mbojo")}
          >
            <i />
            <span>
              MBOJO
              <small>BIMA · DOMPU</small>
            </span>
          </button>
          <span className="map-caption">
            NUSA TENGGARA BARAT <i>·</i> INDONESIA
          </span>
        </div>
      </section>

      <section className="ensemble">
        <div className="ensemble-copy">
          <span className="section-index">04 — RUANG BERMAIN</span>
          <h2>
            Satu irama.
            <br />
            <em>Banyak suara.</em>
          </h2>
          <p>
            Rasakan percakapan bunyi dalam sebuah ansambel. Nyalakan dan
            dengarkan lapisan irama berpadu.
          </p>
          <button
            className={`ensemble-button${ensemble ? " active" : ""}`}
            onClick={toggleEnsemble}
          >
            {ensemble ? "Jeda ansambel" : "Mainkan ansambel"}
            <span>{ensemble ? "Ⅱ" : "▶"}</span>
          </button>
        </div>

        <div className={`ensemble-visual${ensemble ? " playing" : ""}`}>
          <div className="ensemble-circle c1" />
          <div className="ensemble-circle c2" />
          <div className="ensemble-circle c3" />
          <div className="ensemble-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="ensemble-word">
            DENGARKAN
            <br />
            KEBERSAMAAN
          </span>
          <div className="ensemble-label">
            <span>SUARA SIMULASI</span>
            <span>● ANSAMBEL</span>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">ST</span>
          <span>
            SUARA TANAH <b>NTB</b>
          </span>
        </a>
        <span>Merawat bunyi, mengenal budaya.</span>
        <span>LOMBOK · SUMBAWA · BIMA</span>
        <a href="#home" className="back-top">
          KEMBALI KE ATAS ↑
        </a>
      </footer>
    </main>
  );
}

"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  getInstrument,
  instruments,
  type Instrument,
  type InstrumentId,
} from "@/content/instruments";
import { playPart } from "@/lib/audio/engine";
import { InstrumentArt } from "@/components/ui/InstrumentArt";
import type { InstrumentHandle } from "./InstrumentRig";
import { Experience } from "./Experience";

interface StageCanvasProps {
  selectedId: InstrumentId;
  onSelect: (id: InstrumentId) => void;
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(callback: () => void): () => void {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function readMotion(): boolean {
  return window.matchMedia(MOTION_QUERY).matches;
}

function readMotionServer(): boolean {
  return false;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

interface ActivePart {
  instrumentId: InstrumentId;
  part: string;
}

function StageFallback({
  instrument,
  muted,
}: {
  instrument: Instrument;
  muted: boolean;
}) {
  return (
    <div className="stage-fallback">
      <InstrumentArt instrument={instrument} active={false} />
      <p>
        Perangkat ini belum mendukung WebGL. Kamu tetap dapat mendengar
        simulasi suara.
      </p>
      <button
        type="button"
        onClick={() => playPart(instrument.id, instrument.parts[0].id, !muted)}
      >
        Dengarkan {instrument.name}
      </button>
    </div>
  );
}

export default function StageCanvas({
  selectedId,
  onSelect,
}: StageCanvasProps) {
  const selected = getInstrument(selectedId);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const rigRef = useRef<InstrumentHandle | null>(null);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(() => detectWebGL());
  const [muted, setMuted] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    readMotionServer,
  );
  const [hover, setHover] = useState<ActivePart | null>(null);
  const [last, setLast] = useState<ActivePart | null>(null);

  const hoverPart = hover?.instrumentId === selected.id ? hover.part : null;
  const lastPart = last?.instrumentId === selected.id ? last.part : null;

  useEffect(() => {
    if (!last) return;
    const timer = window.setTimeout(() => setLast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [last]);

  useEffect(() => {
    const element = shellRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "160px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleHover = useCallback(
    (part: string | null) => {
      setHover(part ? { instrumentId: selected.id, part } : null);
    },
    [selected.id],
  );

  const handleStrike = useCallback(
    (part: string) => {
      setLast({ instrumentId: selected.id, part });
    },
    [selected.id],
  );

  const activePartId = hoverPart ?? lastPart;
  const activePart = selected.parts.find((part) => part.id === activePartId);
  const hint = activePart
    ? `${activePart.label} — ${activePart.hint}`
    : webgl
      ? "Seret untuk memutar · klik bagian alat"
      : "Pilih bagian alat untuk mendengar suara";

  function strikeFromKeyboard(part: string) {
    if (webgl) {
      rigRef.current?.strike(part);
    } else {
      playPart(selected.id, part, !muted);
    }
    setLast({ instrumentId: selected.id, part });
  }

  return (
    <div className="stage-shell" ref={shellRef}>
      <div className="stage-canvas">
        {webgl === false && <StageFallback instrument={selected} muted={muted} />}

        {webgl && (
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 1.45, 6.4], fov: 34, near: 0.1, far: 40 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
            }}
            performance={{ min: 0.5 }}
            frameloop={visible ? "always" : "never"}
            fallback={<StageFallback instrument={selected} muted={muted} />}
            onPointerMissed={() => setHover(null)}
            role="img"
            aria-label={`Panggung 3D interaktif ${selected.name}. Gunakan tombol bagian alat di bawah untuk memainkan suara.`}
          >
            <Suspense fallback={null}>
              <Experience
                instrument={selected}
                muted={muted}
                motionPaused={motionPaused}
                reducedMotion={reducedMotion}
                rigRef={rigRef}
                onHoverPart={handleHover}
                onStrikePart={handleStrike}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="stage-hud-top">
        <span className="stage-badge">
          <i aria-hidden="true" /> {webgl ? "3D INTERAKTIF" : "MODE AUDIO"}
        </span>
        <div className="stage-controls" role="group" aria-label="Kontrol panggung">
          <button
            type="button"
            className={`stage-toggle${muted ? " is-off" : ""}`}
            onClick={() => setMuted((value) => !value)}
            aria-pressed={muted}
            aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
            title={muted ? "Nyalakan suara" : "Matikan suara"}
          >
            {muted ? "Suara mati" : "Suara"}
          </button>
          {webgl && (
            <button
              type="button"
              className={`stage-toggle${motionPaused ? " is-off" : ""}`}
              onClick={() => setMotionPaused((value) => !value)}
              aria-pressed={motionPaused}
              title={motionPaused ? "Lanjutkan gerak" : "Jeda gerak"}
            >
              {motionPaused ? "Gerak dijeda" : "Jeda gerak"}
            </button>
          )}
        </div>
      </div>

      <p className="stage-hint" aria-live="polite">
        {hint}
      </p>

      <div
        className="stage-parts"
        role="group"
        aria-label={`Bagian ${selected.name}`}
      >
        {selected.parts.map((part) => (
          <button
            key={part.id}
            type="button"
            className={activePartId === part.id ? "is-active" : ""}
            onClick={() => strikeFromKeyboard(part.id)}
            aria-label={`Mainkan bagian ${part.label}`}
          >
            {part.label}
          </button>
        ))}
      </div>

      <div className="stage-rail" role="group" aria-label="Pilih alat musik">
        {instruments.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === selected.id}
            aria-label={item.name}
            title={item.name}
            className={item.id === selected.id ? "is-active" : ""}
            onClick={() => onSelect(item.id)}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}

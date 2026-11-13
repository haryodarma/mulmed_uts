import type { Instrument } from "@/content/instruments";

export function InstrumentArt({
  instrument,
  active,
}: {
  instrument: Instrument;
  active: boolean;
}) {
  return (
    <div
      className={`instrument-art art-${instrument.id}${active ? " is-playing" : ""}`}
      aria-hidden="true"
    >
      <span className="art-glow" />
      {instrument.id === "gendang" && (
        <>
          <span className="drum-rope" />
          <span className="drum-body" />
          <span className="drum-head" />
          <span className="drum-stand" />
        </>
      )}
      {(instrument.id === "gong" || instrument.id === "genang") && (
        <>
          <span className="gong-ring" />
          <span className="gong-face" />
          <span className="gong-boss" />
          {instrument.id === "genang" && <span className="small-gong" />}
        </>
      )}
      {(instrument.id === "cilokaq" || instrument.id === "gambo") && (
        <>
          <span className="string-body" />
          <span className="string-neck" />
          <span className="string-line one" />
          <span className="string-line two" />
          <span className="string-line three" />
        </>
      )}
      {instrument.id === "rebana" && <span className="rebana-face" />}
      {(instrument.id === "serune" || instrument.id === "silu") && (
        <>
          <span className="flute-bell" />
          <span className="flute-body" />
          <span className="flute-joint" />
          <span className="flute-hole h1" />
          <span className="flute-hole h2" />
          <span className="flute-hole h3" />
        </>
      )}
      <span className="art-floor" />
    </div>
  );
}

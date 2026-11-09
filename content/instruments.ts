export type Culture = "Sasak" | "Samawa" | "Mbojo";

export type InstrumentId =
  | "gendang"
  | "gong"
  | "cilokaq"
  | "serune"
  | "genang"
  | "silu";

export interface InstrumentPart {
  /** Nama mesh di scene 3D. */
  id: string;
  label: string;
  hint: string;
}

export interface Instrument {
  id: InstrumentId;
  name: string;
  culture: Culture;
  place: string;
  kind: string;
  note: string;
  detail: string;
  emoji: string;
  /** Frekuensi dasar untuk sintesis suara. */
  tone: number;
  parts: InstrumentPart[];
}

export const instruments: Instrument[] = [
  {
    id: "gendang",
    name: "Gendang Beleq",
    culture: "Sasak",
    place: "Lombok",
    kind: "Membranofon",
    note: "Denyut besar dari Lombok",
    detail:
      "Gendang berukuran besar yang menjadi pusat irama dalam pertunjukan Gendang Beleq. Pemain membawa dan menabuhnya sambil bergerak dalam formasi.",
    emoji: "◉",
    tone: 110,
    parts: [
      { id: "kulit", label: "Kulit", hint: "Klik kulit untuk memukul" },
      { id: "tali", label: "Tali", hint: "Tali rotan menegangkan kulit" },
      { id: "badan", label: "Badan", hint: "Badan kayu yang menggembung" },
      { id: "pemukul", label: "Pemukul", hint: "Pemukul kayu berbalut kain" },
    ],
  },
  {
    id: "gong",
    name: "Gong & Oncer",
    culture: "Sasak",
    place: "Lombok",
    kind: "Idiofon",
    note: "Gema yang menyatukan langkah",
    detail:
      "Gong dan oncer memberi aksen serta penanda irama dalam ansambel. Bunyi gong yang panjang menjadi lapisan suara yang khas.",
    emoji: "◉",
    tone: 180,
    parts: [
      { id: "pencu", label: "Pencu", hint: "Pencu di tengah gong menghasilkan dengung" },
      { id: "gong", label: "Gong", hint: "Badan logam bergema panjang" },
      { id: "oncer", label: "Oncer", hint: "Oncer kecil memberi aksen cepat" },
    ],
  },
  {
    id: "cilokaq",
    name: "Cilokaq / Cungklik",
    culture: "Sasak",
    place: "Lombok",
    kind: "Kordofon",
    note: "Petikan kayu yang lincah",
    detail:
      "Alat musik berdawai dari tradisi Sasak. Petikan melodinya mengisi ruang di antara pukulan perkusi.",
    emoji: "♬",
    tone: 330,
    parts: [
      { id: "dawai", label: "Dawai", hint: "Klik dawai untuk memetik" },
      { id: "badan", label: "Badan", hint: "Badan kayu memperkuat bunyi" },
      { id: "leher", label: "Leher", hint: "Leher tempat menekan nada" },
    ],
  },
  {
    id: "serune",
    name: "Serune",
    culture: "Samawa",
    place: "Sumbawa",
    kind: "Aerofon",
    note: "Nada tiup dari tanah Samawa",
    detail:
      "Serune dimainkan dengan ditiup dan membawa garis melodi yang menonjol dalam musik tradisional Sumbawa.",
    emoji: "◖",
    tone: 440,
    parts: [
      { id: "corong", label: "Corong", hint: "Corong melebarkan nada" },
      { id: "lubang", label: "Lubang nada", hint: "Lubang mengatur tinggi nada" },
      { id: "badan", label: "Badan", hint: "Badan kayu tempat udara bergetar" },
    ],
  },
  {
    id: "genang",
    name: "Gong Genang",
    culture: "Samawa",
    place: "Sumbawa",
    kind: "Ansambel",
    note: "Percakapan gong dan genang",
    detail:
      "Ansambel tradisional Sumbawa yang memadukan gong dan genang untuk membentuk pola irama bersama.",
    emoji: "◉",
    tone: 146,
    parts: [
      { id: "gong", label: "Gong", hint: "Gong memberi dasar irama" },
      { id: "genang", label: "Genang", hint: "Gendang genang mengisi ketukan" },
      { id: "pencu", label: "Pencu", hint: "Pencu menyorot aksen gong" },
    ],
  },
  {
    id: "silu",
    name: "Silu",
    culture: "Mbojo",
    place: "Bima · Dompu",
    kind: "Aerofon",
    note: "Suara tiup dari Bima",
    detail:
      "Alat musik tiup tradisional masyarakat Mbojo. Silu menghadirkan warna melodi dalam kesenian daerah Bima dan Dompu.",
    emoji: "◖",
    tone: 523,
    parts: [
      { id: "corong", label: "Corong", hint: "Corong membentuk warna nada" },
      { id: "lubang", label: "Lubang nada", hint: "Lubang mengatur melodi" },
      { id: "badan", label: "Badan", hint: "Tabung kayu yang panjang" },
    ],
  },
];

export const cultures: Array<Culture | "Semua"> = [
  "Semua",
  "Sasak",
  "Samawa",
  "Mbojo",
];

export function getInstrument(id: InstrumentId): Instrument {
  const found = instruments.find((instrument) => instrument.id === id);
  return found ?? instruments[0];
}

import type { InstrumentId } from "@/content/instruments";

type AudioContextConstructor = typeof AudioContext;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!context) {
    const ContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: AudioContextConstructor })
        .webkitAudioContext;

    if (!ContextClass) return null;

    context = new ContextClass();
    master = context.createGain();
    master.gain.value = 0.7;
    master.connect(context.destination);
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  return context;
}

function getNoise(audio: AudioContext): AudioBuffer {
  if (noise) return noise;

  const length = Math.floor(audio.sampleRate * 2);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[index] = last * 3.2;
  }

  noise = buffer;
  return buffer;
}

interface ToneOptions {
  frequency: number;
  duration?: number;
  gain?: number;
  type?: OscillatorType;
  attack?: number;
  vibrato?: number;
  filter?: number;
  detune?: number;
}

function playToneNode(audio: AudioContext, options: ToneOptions): void {
  const {
    frequency,
    duration = 0.6,
    gain = 0.12,
    type = "sine",
    attack = 0.006,
    vibrato = 0,
    filter,
    detune = 0,
  } = options;

  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(20, frequency), now);
  oscillator.detune.value = detune;

  let output: AudioNode = oscillator;

  if (filter) {
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = filter;
    lowpass.Q.value = 0.7;
    oscillator.connect(lowpass);
    output = lowpass;
  }

  if (vibrato > 0) {
    const lfo = audio.createOscillator();
    const depth = audio.createGain();
    lfo.frequency.value = 5.2;
    depth.gain.value = vibrato;
    lfo.connect(depth);
    depth.connect(oscillator.frequency);
    lfo.start(now);
    lfo.stop(now + duration + 0.1);
  }

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(gain, now + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  output.connect(envelope);
  envelope.connect(master ?? audio.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.05);
}

interface NoiseOptions {
  duration?: number;
  gain?: number;
  frequency?: number;
  type?: BiquadFilterType;
}

function playNoise(audio: AudioContext, options: NoiseOptions = {}): void {
  const {
    duration = 0.15,
    gain = 0.12,
    frequency = 900,
    type = "lowpass",
  } = options;

  const now = audio.currentTime;
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const envelope = audio.createGain();

  source.buffer = getNoise(audio);
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = 0.8;

  envelope.gain.setValueAtTime(gain, now);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(master ?? audio.destination);

  source.start(now);
  source.stop(now + duration + 0.02);
}

function playDrum(audio: AudioContext, base: number, strength = 1): void {
  const now = audio.currentTime;
  const body = audio.createOscillator();
  const envelope = audio.createGain();

  body.type = "sine";
  body.frequency.setValueAtTime(base, now);
  body.frequency.exponentialRampToValueAtTime(base * 0.48, now + 0.22);

  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.42 * strength, now + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  body.connect(envelope);
  envelope.connect(master ?? audio.destination);
  body.start(now);
  body.stop(now + 0.6);

  playNoise(audio, {
    duration: 0.12,
    gain: 0.18 * strength,
    frequency: 780,
  });
}

function playGong(audio: AudioContext, base: number, strength = 1): void {
  const partials = [
    { ratio: 1, gain: 0.16, duration: 3.6 },
    { ratio: 1.47, gain: 0.09, duration: 2.8 },
    { ratio: 1.96, gain: 0.07, duration: 2.2 },
    { ratio: 2.72, gain: 0.045, duration: 1.7 },
  ];

  partials.forEach((partial, index) => {
    playToneNode(audio, {
      frequency: base * partial.ratio,
      duration: partial.duration,
      gain: partial.gain * strength,
      type: "sine",
      attack: 0.012,
      detune: index * 3,
    });
  });

  playNoise(audio, {
    duration: 0.06,
    gain: 0.05 * strength,
    frequency: 2200,
    type: "highpass",
  });
}

function playString(audio: AudioContext, base: number, strength = 1): void {
  playToneNode(audio, {
    frequency: base,
    duration: 0.62,
    gain: 0.14 * strength,
    type: "triangle",
    attack: 0.004,
    filter: 2600,
  });

  playToneNode(audio, {
    frequency: base * 2.01,
    duration: 0.34,
    gain: 0.05 * strength,
    type: "sine",
    attack: 0.003,
  });

  playNoise(audio, {
    duration: 0.035,
    gain: 0.06 * strength,
    frequency: 1800,
    type: "highpass",
  });
}

function playFlute(audio: AudioContext, base: number, strength = 1): void {
  playToneNode(audio, {
    frequency: base,
    duration: 1.15,
    gain: 0.11 * strength,
    type: "sine",
    attack: 0.06,
    vibrato: 4.5,
  });

  playToneNode(audio, {
    frequency: base * 0.5,
    duration: 0.9,
    gain: 0.035 * strength,
    type: "triangle",
    attack: 0.08,
  });

  playNoise(audio, {
    duration: 0.65,
    gain: 0.035 * strength,
    frequency: base * 2.2,
    type: "bandpass",
  });
}

/**
 * Memutar bunyi simulasi untuk satu bagian alat.
 * AudioContext selalu dibuat/dilanjutkan dari gestur pengguna.
 */
export function playPart(
  instrument: InstrumentId,
  part: string,
  enabled = true,
): void {
  if (!enabled) return;

  const audio = getContext();
  if (!audio) return;

  switch (instrument) {
    case "gendang": {
      if (part === "kulit") {
        playDrum(audio, 105);
      } else if (part === "pemukul") {
        playDrum(audio, 120, 0.55);
        playNoise(audio, { duration: 0.05, gain: 0.06, frequency: 1600, type: "highpass" });
      } else if (part === "tali") {
        playNoise(audio, { duration: 0.2, gain: 0.07, frequency: 480 });
      } else {
        playDrum(audio, 78, 0.45);
      }
      break;
    }
    case "gong": {
      if (part === "oncer") {
        playGong(audio, 620, 0.55);
      } else if (part === "pencu") {
        playGong(audio, 186, 1.15);
      } else {
        playGong(audio, 132, 0.9);
      }
      break;
    }
    case "cilokaq": {
      const note = part === "leher" ? 392 : part === "badan" ? 294 : 330;
      playString(audio, note);
      break;
    }
    case "serune": {
      playFlute(audio, part === "corong" ? 466 : part === "lubang" ? 523 : 440);
      break;
    }
    case "genang": {
      if (part === "genang") {
        playDrum(audio, 92, 0.9);
      } else if (part === "pencu") {
        playGong(audio, 154, 1.1);
      } else {
        playGong(audio, 118, 0.85);
      }
      break;
    }
    case "silu": {
      playFlute(audio, part === "corong" ? 587 : part === "lubang" ? 659 : 523);
      break;
    }
    default: {
      playToneNode(audio, { frequency: 220, duration: 0.5 });
    }
  }
}

/** Bunyi sederhana untuk fallback tanpa WebGL. */
export function playTone(frequency: number, duration = 0.65): void {
  const audio = getContext();
  if (!audio) return;

  playToneNode(audio, {
    frequency,
    duration,
    gain: 0.16,
    type: "sine",
  });
}

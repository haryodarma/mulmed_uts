"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
import type { Instrument } from "@/content/instruments";
import type { InstrumentHandle } from "./InstrumentRig";
import { InstrumentRig } from "./InstrumentRig";
import { Stage } from "./Stage";

interface ExperienceProps {
  instrument: Instrument;
  muted: boolean;
  motionPaused: boolean;
  reducedMotion: boolean;
  rigRef: React.RefObject<InstrumentHandle | null>;
  onHoverPart: (part: string | null) => void;
  onStrikePart: (part: string) => void;
}

function CameraRig() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const aspect = size.width / Math.max(1, size.height);
    camera.position.set(0, 1.45, aspect < 0.9 ? 7.6 : 6.4);
    camera.lookAt(0, 0, 0);
  }, [camera, size.height, size.width]);

  return null;
}

export function Experience({
  instrument,
  muted,
  motionPaused,
  reducedMotion,
  rigRef,
  onHoverPart,
  onStrikePart,
}: ExperienceProps) {
  const [lowQuality, setLowQuality] = useState(false);

  return (
    <>
      <CameraRig />

      <ambientLight intensity={0.34} />
      <hemisphereLight intensity={0.4} color="#dfe9d8" groundColor="#2d1b11" />
      <directionalLight
        position={[4.5, 6, 4]}
        intensity={2.6}
        color="#ffe0b8"
      />
      <directionalLight
        position={[-5, 2.5, 2]}
        intensity={0.72}
        color="#a9c7d8"
      />
      <spotLight
        position={[0, 4.5, -4.5]}
        intensity={22}
        angle={0.7}
        penumbra={1}
        color="#ffd39a"
        distance={13}
        decay={2}
      />

      <Suspense fallback={null}>
        <Environment resolution={64}>
          <Lightformer
            form="rect"
            intensity={2.6}
            color="#ffe3c2"
            position={[0, 4, -3]}
            scale={[7, 4, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.1}
            color="#a9c7d8"
            position={[-4, 2, 3]}
            scale={[4, 4, 1]}
          />
          <Lightformer
            form="ring"
            intensity={1.8}
            color="#d7e978"
            position={[3.5, 1.4, -2]}
            scale={2.4}
          />
          <Lightformer
            form="rect"
            intensity={1.35}
            color="#ffe9c8"
            position={[0, 2.4, 6]}
            scale={[6, 4, 1]}
          />
        </Environment>
      </Suspense>

      <Stage reducedMotion={reducedMotion || motionPaused || lowQuality} />

      <InstrumentRig
        ref={rigRef}
        instrument={instrument}
        muted={muted}
        motionPaused={motionPaused}
        reducedMotion={reducedMotion}
        onHoverPart={onHoverPart}
        onStrikePart={onStrikePart}
      />

      <ContactShadows
        position={[0, -1.292, 0]}
        opacity={lowQuality ? 0.34 : 0.52}
        scale={9}
        blur={2.6}
        far={5}
        resolution={lowQuality ? 128 : 256}
        color="#07110c"
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        minDistance={4.2}
        maxDistance={8.5}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.85}
        target={[0, 0, 0]}
      />

      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setLowQuality(true)}
        onIncline={() => setLowQuality(false)}
      />
    </>
  );
}

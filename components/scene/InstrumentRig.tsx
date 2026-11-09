"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { Instrument } from "@/content/instruments";
import { playPart } from "@/lib/audio/engine";
import { buildInstrument, disposeObject } from "@/lib/procedural/builders";

export interface InstrumentHandle {
  strike: (part: string) => void;
}

interface InstrumentRigProps {
  instrument: Instrument;
  muted: boolean;
  motionPaused: boolean;
  reducedMotion: boolean;
  onHoverPart: (part: string | null) => void;
  onStrikePart: (part: string) => void;
}

interface Origin {
  object: THREE.Object3D;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface StrikeState {
  part: string;
  start: number;
  duration: number;
}

export const InstrumentRig = forwardRef<InstrumentHandle, InstrumentRigProps>(
  function InstrumentRig(
    {
      instrument,
      muted,
      motionPaused,
      reducedMotion,
      onHoverPart,
      onStrikePart,
    },
    ref,
  ) {
    const mount = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const parts = useRef<Record<string, THREE.Object3D[]>>({});
    const origins = useRef<Origin[]>([]);
    const highlighted = useRef<THREE.Material[]>([]);
    const strike = useRef<StrikeState | null>(null);
    const born = useRef(0);

    const model = useMemo(() => buildInstrument(instrument.id), [instrument.id]);

    useCursor(hovered !== null);

    useEffect(() => {
      const map: Record<string, THREE.Object3D[]> = {};
      const collected: Origin[] = [];

      model.traverse((object) => {
        if (object.name) {
          (map[object.name] ??= []).push(object);
          collected.push({
            object,
            position: object.position.clone(),
            rotation: object.rotation.clone(),
            scale: object.scale.clone(),
          });
        }
      });

      parts.current = map;
      origins.current = collected;
      born.current = performance.now();

      return () => {
        disposeObject(model);
      };
    }, [model]);

    useEffect(() => {
      setHovered(null);
      onHoverPart(null);
    }, [instrument.id, onHoverPart]);

    function applyHighlight(part: string | null) {
      highlighted.current.forEach((material) => {
        if ("emissive" in material) {
          (material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      });
      highlighted.current = [];

      if (!part) return;

      (parts.current[part] ?? []).forEach((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          if (!("emissive" in material)) return;
          const standard = material as THREE.MeshStandardMaterial;
          standard.emissive = new THREE.Color("#d7e978");
          standard.emissiveIntensity = 0.16;
          highlighted.current.push(standard);
        });
      });
    }

    const strikePart = useCallback(
      (part: string) => {
        if (!parts.current[part]) return;

        strike.current = {
          part,
          start: performance.now(),
          duration: part === "gong" || part === "pencu" ? 2.4 : 1.5,
        };
        playPart(instrument.id, part, !muted);
        onStrikePart(part);
      },
      [instrument.id, muted, onStrikePart],
    );

    useImperativeHandle(
      ref,
      () => ({
        strike: strikePart,
      }),
      [strikePart],
    );

    function handleHover(part: string | null) {
      if (part === hovered) return;
      setHovered(part);
      applyHighlight(part);
      onHoverPart(part);
    }

    useFrame((state, delta) => {
      const group = mount.current;
      if (!group) return;

      const now = performance.now();
      const time = state.clock.elapsedTime;
      const intro = reducedMotion
        ? 1
        : Math.min(1, (now - born.current) / 620);
      const easedIntro = 1 - Math.pow(1 - intro, 3);
      const canMove = !motionPaused && !reducedMotion;

      const idleY = canMove ? Math.sin(time * 0.24) * 0.075 : 0;
      const idleX = canMove ? Math.sin(time * 0.18) * 0.016 : 0;
      const idleLift = canMove ? Math.sin(time * 0.5) * 0.012 : 0;
      const breathing = canMove ? 1 + Math.sin(time * 0.62) * 0.004 : 1;

      group.rotation.y = THREE.MathUtils.damp(
        group.rotation.y,
        idleY - (1 - easedIntro) * 0.28,
        4.5,
        delta,
      );
      group.rotation.x = THREE.MathUtils.damp(
        group.rotation.x,
        idleX,
        4,
        delta,
      );
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        -1.28 + idleLift,
        5,
        delta,
      );
      const targetScale = (0.88 + 0.12 * easedIntro) * breathing;
      const currentScale = THREE.MathUtils.damp(
        group.scale.x,
        targetScale,
        5,
        delta,
      );
      group.scale.setScalar(currentScale);

      const current = strike.current;
      if (!current) {
        return;
      }

      const elapsed = (now - current.start) / 1000;

      if (elapsed > current.duration) {
        strike.current = null;
        origins.current.forEach(({ object, position, rotation, scale }) => {
          object.position.copy(position);
          object.rotation.copy(rotation);
          object.scale.copy(scale);
        });
        return;
      }

      const decay =
        current.part === "gong" ||
        current.part === "pencu" ||
        current.part === "oncer"
          ? Math.exp(-elapsed / 0.55)
          : Math.exp(-elapsed / 0.16);
      const amplitude = reducedMotion ? decay * 0.25 : decay;

      const targets = parts.current[current.part] ?? [];

      targets.forEach((object, index) => {
        const origin = origins.current.find((item) => item.object === object);
        if (!origin) return;

        switch (current.part) {
          case "kulit": {
            object.position.y =
              origin.position.y - 0.045 * amplitude * Math.sin(elapsed * 58);
            object.scale.set(
              origin.scale.x + 0.02 * amplitude * Math.sin(elapsed * 58),
              origin.scale.y,
              origin.scale.z + 0.02 * amplitude * Math.sin(elapsed * 58),
            );
            break;
          }
          case "gong":
          case "pencu":
          case "oncer": {
            if (object === targets[index]) {
              object.rotation.z =
                origin.rotation.z +
                0.028 * amplitude * Math.sin(elapsed * 15 + index);
            }
            break;
          }
          case "dawai": {
            object.position.z =
              origin.position.z +
              0.032 * amplitude * Math.sin(elapsed * 72 + index * 0.8);
            break;
          }
          case "corong": {
            object.rotation.z =
              origin.rotation.z +
              0.018 * amplitude * Math.sin(elapsed * 34 + index);
            object.scale.set(
              origin.scale.x + 0.03 * amplitude * Math.sin(elapsed * 30),
              origin.scale.y,
              origin.scale.z,
            );
            break;
          }
          case "pemukul": {
            object.rotation.z =
              origin.rotation.z -
              0.42 * amplitude * Math.sin(elapsed * 11);
            break;
          }
          case "lubang": {
            object.scale.set(
              origin.scale.x + 0.18 * amplitude,
              origin.scale.y + 0.18 * amplitude,
              origin.scale.z,
            );
            break;
          }
          default: {
            object.rotation.z =
              origin.rotation.z +
              0.012 * amplitude * Math.sin(elapsed * 26 + index);
            object.scale.set(
              origin.scale.x + 0.008 * amplitude * Math.sin(elapsed * 20),
              origin.scale.y,
              origin.scale.z,
            );
          }
        }
      });

      group.position.x = 0.012 * amplitude * Math.sin(elapsed * 42);
    });

    return (
      <group ref={mount} position={[0, -1.28, 0]}>
        <primitive
          object={model}
          onPointerOver={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            const name = event.object.name;
            if (name && parts.current[name]) handleHover(name);
          }}
          onPointerOut={(event: ThreeEvent<PointerEvent>) => {
            event.stopPropagation();
            handleHover(null);
          }}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation();
            const name = event.object.name;
            if (name && parts.current[name]) strikePart(name);
          }}
        />
      </group>
    );
  },
);

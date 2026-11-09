"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Stage({ reducedMotion }: { reducedMotion: boolean }) {
  const dust = useRef<THREE.Points>(null);

  const dustPositions = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < 150; index += 1) {
      const radius = 1.2 + random() * 3.1;
      const angle = random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = random() * 3.2 - 0.8;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }

    return positions;
  }, []);

  useFrame((state, delta) => {
    if (!dust.current || reducedMotion) return;
    dust.current.rotation.y += delta * 0.015;
    dust.current.position.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.04;
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.3, 0]}>
        <circleGeometry args={[4.6, 64]} />
        <meshStandardMaterial color="#12231b" roughness={0.95} metalness={0.06} />
      </mesh>

      {[1.55, 2.35, 3.15, 3.95].map((radius, index) => (
        <mesh
          key={radius}
          rotation-x={-Math.PI / 2}
          position={[0, -1.292, 0]}
        >
          <torusGeometry args={[radius, 0.0045, 5, 90]} />
          <meshBasicMaterial
            color="#9db39c"
            transparent
            opacity={0.18 - index * 0.03}
          />
        </mesh>
      ))}

      <mesh rotation-x={-Math.PI / 2} position={[0, -1.288, 0]}>
        <ringGeometry args={[1.28, 1.34, 64]} />
        <meshBasicMaterial color="#d7e978" transparent opacity={0.14} />
      </mesh>

      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#d7e978"
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

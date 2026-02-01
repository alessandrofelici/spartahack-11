import { useRef } from 'react';
import * as THREE from 'three';

export default function Road() {
  const roadRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Main road surface */}
      <mesh
        ref={roadRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[24, 4]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Road edges - top */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -2]}
      >
        <planeGeometry args={[24, 0.1]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Road edges - bottom */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 2]}
      >
        <planeGeometry args={[24, 0.1]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Center lane dashes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-10 + i * 2, 0.01, 0]}
        >
          <planeGeometry args={[1, 0.08]} />
          <meshStandardMaterial
            color="#374151"
            emissive="#374151"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Grid lines for cyberpunk effect */}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh
          key={`grid-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-12 + i, 0.005, 0]}
        >
          <planeGeometry args={[0.02, 4]} />
          <meshStandardMaterial
            color="#0f172a"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface BotProps {
  position: [number, number, number];
  visible: boolean;
  isScanning?: boolean;
}

export default function Bot({ position, visible, isScanning = false }: BotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const scannerRef = useRef<THREE.Mesh>(null);

  // Smooth position and visibility animation
  const { pos, opacity, scale } = useSpring({
    pos: position,
    opacity: visible ? 1 : 0,
    scale: visible ? 1 : 0,
    config: { mass: 1, tension: 120, friction: 14 },
  });

  // Hovering and rotation animation
  useFrame((state) => {
    if (groupRef.current && visible) {
      // Gentle hovering motion
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      // Slow rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }

    // Eye pulse when scanning
    if (eyeRef.current && isScanning) {
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
      (eyeRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }

    // Scanner beam animation
    if (scannerRef.current && isScanning) {
      scannerRef.current.rotation.z = state.clock.elapsedTime * 3;
      const scanScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      scannerRef.current.scale.set(scanScale, scanScale, 1);
    }
  });

  if (!visible) return null;

  return (
    <animated.group
      ref={groupRef}
      position={pos as unknown as THREE.Vector3}
      scale={scale}
    >
      {/* Main body - octahedron */}
      <mesh castShadow>
        <octahedronGeometry args={[0.6, 0]} />
        <animated.meshStandardMaterial
          color="#1f2937"
          emissive="#ef4444"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Inner core */}
      <mesh>
        <octahedronGeometry args={[0.35, 0]} />
        <animated.meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Eye / sensor */}
      <mesh ref={eyeRef} position={[0, 0, 0.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isScanning ? 0.8 : 0.4}
        />
      </mesh>

      {/* Antenna points */}
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial
          color="#374151"
          emissive="#ef4444"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Side fins */}
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.05, 0.15]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.3, 0.05, 0.15]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Scanner beam when scanning */}
      {isScanning && (
        <group position={[0, -2, 0]}>
          {/* Scanner cone */}
          <mesh ref={scannerRef} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[2, 4, 32, 1, true]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.3}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Scanner ring */}
          <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2, 0.02, 8, 64]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}

      {/* Orbiting particles */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI * 2) / 3) * 0.9,
            0,
            Math.sin((i * Math.PI * 2) / 3) * 0.9,
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </animated.group>
  );
}

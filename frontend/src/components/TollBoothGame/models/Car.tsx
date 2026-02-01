import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface CarProps {
  position: [number, number, number];
  hasShield?: boolean;
  isHighlighted?: boolean;
}

export default function Car({ position, hasShield = false, isHighlighted = false }: CarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shieldRef = useRef<THREE.Mesh>(null);

  // Smooth position animation
  const { pos } = useSpring({
    pos: position,
    config: { mass: 1, tension: 80, friction: 20 },
  });

  // Shield pulse animation
  useFrame((state) => {
    if (shieldRef.current && hasShield) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      shieldRef.current.scale.setScalar(scale);
    }
  });

  const bodyColor = isHighlighted ? '#34d399' : '#10b981';
  const emissiveIntensity = isHighlighted ? 0.5 : 0.2;

  return (
    <animated.group ref={groupRef} position={pos as unknown as THREE.Vector3}>
      {/* Car body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Car cabin */}
      <mesh position={[0.1, 0.45, 0]} castShadow>
        <boxGeometry args={[1, 0.4, 0.85]} />
        <meshStandardMaterial
          color="#064e3b"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Front wheel */}
      <mesh position={[0.6, -0.2, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.6, -0.2, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Rear wheel */}
      <mesh position={[-0.6, -0.2, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.6, -0.2, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Headlights */}
      <mesh position={[1.01, 0, 0.3]}>
        <boxGeometry args={[0.05, 0.15, 0.2]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[1.01, 0, -0.3]}>
        <boxGeometry args={[0.05, 0.15, 0.2]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[-1.01, 0, 0.35]}>
        <boxGeometry args={[0.05, 0.12, 0.15]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[-1.01, 0, -0.35]}>
        <boxGeometry args={[0.05, 0.12, 0.15]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Shield effect */}
      {hasShield && (
        <mesh ref={shieldRef} position={[0, 0.2, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.3}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Shield ring */}
      {hasShield && (
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.03, 16, 64]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
    </animated.group>
  );
}

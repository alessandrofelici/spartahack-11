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
      {/* Main car body - lower section */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 1.1]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Car hood */}
      <mesh position={[0.7, 0.15, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 1.1]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Car cabin/roof */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={emissiveIntensity * 0.7}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Front windshield */}
      <mesh position={[0.4, 0.55, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.95]} />
        <meshStandardMaterial
          color="#1a3a4a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Rear windshield */}
      <mesh position={[-0.4, 0.55, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.95]} />
        <meshStandardMaterial
          color="#1a3a4a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Side windows - left */}
      <mesh position={[0, 0.5, 0.51]} castShadow>
        <boxGeometry args={[1.15, 0.45, 0.02]} />
        <meshStandardMaterial
          color="#0a1a2a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Side windows - right */}
      <mesh position={[0, 0.5, -0.51]} castShadow>
        <boxGeometry args={[1.15, 0.45, 0.02]} />
        <meshStandardMaterial
          color="#0a1a2a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Side mirrors - left */}
      <mesh position={[0.3, 0.4, 0.65]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.08]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Side mirrors - right */}
      <mesh position={[0.3, 0.4, -0.65]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.08]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Spoiler */}
      <mesh position={[-1, 0.65, 0]} castShadow>
        <boxGeometry args={[0.2, 0.05, 1.1]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={emissiveIntensity * 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Spoiler support - left */}
      <mesh position={[-1, 0.5, 0.4]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.05]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Spoiler support - right */}
      <mesh position={[-1, 0.5, -0.4]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.05]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Front grill */}
      <mesh position={[1.11, 0, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.8]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>

      {/* Front wheel - left */}
      <mesh position={[0.7, -0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 20]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.7, -0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.19, 20]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Front wheel - right */}
      <mesh position={[0.7, -0.2, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 20]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.7, -0.2, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.19, 20]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Rear wheel - left */}
      <mesh position={[-0.7, -0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 20]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.7, -0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.19, 20]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Rear wheel - right */}
      <mesh position={[-0.7, -0.2, -0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 20]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.7, -0.2, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.19, 20]} />
        <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Headlights - left */}
      <mesh position={[1.12, 0.05, 0.4]}>
        <boxGeometry args={[0.04, 0.18, 0.25]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Headlights - right */}
      <mesh position={[1.12, 0.05, -0.4]}>
        <boxGeometry args={[0.04, 0.18, 0.25]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Taillights - left */}
      <mesh position={[-1.12, 0.05, 0.45]}>
        <boxGeometry args={[0.04, 0.15, 0.18]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Taillights - right */}
      <mesh position={[-1.12, 0.05, -0.45]}>
        <boxGeometry args={[0.04, 0.15, 0.18]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.7}
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

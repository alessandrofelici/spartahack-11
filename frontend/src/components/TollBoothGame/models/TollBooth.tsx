import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface TollBoothProps {
  position: [number, number, number];
  price: number;
  isActive?: boolean;
}

export default function TollBooth({ position, price, isActive = true }: TollBoothProps) {
  const barrierRef = useRef<THREE.Group>(null);

  // Barrier animation
  useFrame(() => {
    if (barrierRef.current) {
      const targetRotation = isActive ? 0 : -Math.PI / 2;
      barrierRef.current.rotation.z += (targetRotation - barrierRef.current.rotation.z) * 0.05;
    }
  });

  // Determine price color based on value
  const getPriceColor = () => {
    if (price <= 100) return '#10b981'; // Green - good price
    if (price <= 120) return '#f59e0b'; // Yellow - moderate
    return '#ef4444'; // Red - high price
  };

  return (
    <group position={position}>
      {/* Booth structure */}
      <mesh position={[0, 1.2, -1.5]} castShadow>
        <boxGeometry args={[1.5, 2.4, 1.2]} />
        <meshStandardMaterial
          color="#1f2937"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Booth window */}
      <mesh position={[0, 1.5, -0.85]}>
        <boxGeometry args={[1, 0.8, 0.1]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#10b981"
          emissiveIntensity={0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Booth roof */}
      <mesh position={[0, 2.6, -1.5]} castShadow>
        <boxGeometry args={[2, 0.2, 1.8]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Barrier post */}
      <mesh position={[0, 0.6, 0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 1.2, 8]} />
        <meshStandardMaterial
          color="#374151"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Barrier arm group */}
      <group ref={barrierRef} position={[0, 1.2, 0.5]}>
        {/* Barrier arm */}
        <mesh position={[-2, 0, 0]} castShadow>
          <boxGeometry args={[4, 0.12, 0.12]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Barrier stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-3.5 + i * 0.5, 0, 0.07]}>
            <boxGeometry args={[0.15, 0.14, 0.02]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ffffff' : '#ef4444'}
              emissive={i % 2 === 0 ? '#ffffff' : '#ef4444'}
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Price display panel */}
      <mesh position={[0, 2, 0.8]}>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Price display border */}
      <mesh position={[0, 2, 0.86]}>
        <boxGeometry args={[1.3, 0.7, 0.02]} />
        <meshStandardMaterial
          color={getPriceColor()}
          emissive={getPriceColor()}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Price text */}
      <Text
        position={[0, 2, 0.92]}
        fontSize={0.25}
        color={getPriceColor()}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        ${price}
      </Text>

      {/* TOLL label */}
      <Text
        position={[0, 2.5, -0.85]}
        fontSize={0.2}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        TOLL
      </Text>

      {/* Ground marking - stop line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.5, 0.02, 0]}>
        <planeGeometry args={[0.15, 3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Booth lights */}
      <pointLight
        position={[0, 2.5, 0]}
        color="#10b981"
        intensity={0.5}
        distance={5}
      />

      {/* Warning light */}
      <mesh position={[0, 2.8, -1.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? '#10b981' : '#ef4444'}
          emissive={isActive ? '#10b981' : '#ef4444'}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

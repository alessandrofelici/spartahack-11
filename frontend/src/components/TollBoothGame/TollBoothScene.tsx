import { PerspectiveCamera } from '@react-three/drei';
import Road from './models/Road';
import TollBooth from './models/TollBooth';
import Car from './models/Car';
import Bot from './models/Bot';
import type { GameState } from './hooks/useGameState';

interface Props {
  gameState: GameState;
}

export default function TollBoothScene({ gameState }: Props) {
  const { currentConfig, stage } = gameState;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-8, 5, 0]} color="#10b981" intensity={0.3} />
      <pointLight position={[8, 5, 0]} color="#10b981" intensity={0.3} />

      {/* Camera - side view */}
      <PerspectiveCamera
        makeDefault
        position={[0, 4, 12]}
        fov={45}
        near={0.1}
        far={100}
      />

      {/* Environment */}
      <color attach="background" args={['#1a1a1a']} />
      <fog attach="fog" args={['#1a1a1a', 15, 35]} />

      {/* Ground plane for shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Scene Objects */}
      <Road />
      <TollBooth
        position={[5, 0, 0]}
        price={currentConfig.tollPrice}
        isActive={true}
      />
      <Car
        position={currentConfig.carPosition}
        hasShield={currentConfig.hasProtection}
        isHighlighted={stage === 3 || stage === 8}
      />
      <Bot
        position={currentConfig.botPosition}
        visible={currentConfig.botVisible}
        isScanning={currentConfig.showScanner}
      />

      {/* Background grid for cyberpunk effect */}
      <gridHelper
        args={[50, 50, '#1f2937', '#0f172a']}
        position={[0, -0.02, 0]}
      />
    </>
  );
}

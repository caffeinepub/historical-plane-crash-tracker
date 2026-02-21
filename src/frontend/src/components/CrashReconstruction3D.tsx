import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { type CrashRecord } from '../backend';
import { getModelForAircraftType } from '../utils/aircraftModelMapping';
import { Button } from '@/components/ui/button';
import { RotateCcw, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import * as THREE from 'three';

interface CrashReconstruction3DProps {
  crash: CrashRecord;
}

function AircraftModel({ aircraftType, phaseOfFlight }: { aircraftType: string; phaseOfFlight: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const modelInfo = getModelForAircraftType(aircraftType);

  // Gentle rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Determine damage visualization based on phase
  const getDamageColor = () => {
    switch (phaseOfFlight.toLowerCase()) {
      case 'takeoff':
      case 'climb':
        return '#ff6b6b';
      case 'cruise':
        return '#ffa500';
      case 'descent':
      case 'approach':
        return '#ff8c42';
      case 'landing':
      case 'ground':
        return '#d32f2f';
      default:
        return '#999999';
    }
  };

  return (
    <group>
      {/* Main fuselage */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 4, 32]} />
        <meshStandardMaterial 
          color={getDamageColor()} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Wings */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <boxGeometry args={[0.2, 6, 1.5]} />
        <meshStandardMaterial 
          color={getDamageColor()} 
          metalness={0.5} 
          roughness={0.5}
        />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.8, -1.8]} castShadow>
        <boxGeometry args={[0.1, 1.5, 0.8]} />
        <meshStandardMaterial 
          color={getDamageColor()} 
          metalness={0.5} 
          roughness={0.5}
        />
      </mesh>

      {/* Damage effects - scattered debris */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 3,
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
        >
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial 
            color={getDamageColor()} 
            metalness={0.7} 
            roughness={0.3}
            opacity={0.7}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ crash }: { crash: CrashRecord }) {
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={50} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      
      <Suspense fallback={null}>
        <AircraftModel 
          aircraftType={crash.aircraft.aircraftType} 
          phaseOfFlight={crash.phaseOfFlight}
        />
        <Environment preset="sunset" />
      </Suspense>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[20, 20, '#444444', '#333333']} position={[0, -1.99, 0]} />
    </>
  );
}

export default function CrashReconstruction3D({ crash }: CrashReconstruction3DProps) {
  const controlsRef = useRef<any>(null);

  return (
    <div className="space-y-4">
      <Card className="bg-muted/50">
        <CardContent className="p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            Interactive 3D reconstruction showing aircraft damage visualization. 
            Use mouse to rotate, zoom, and pan the view. 
            Damage coloring reflects the phase of flight at time of crash.
          </div>
        </CardContent>
      </Card>

      <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden border border-border">
        <Canvas shadows>
          <Scene crash={crash} />
        </Canvas>

        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              // Reset would be handled by the controls ref
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="space-y-1">
          <div className="text-muted-foreground">Aircraft Type</div>
          <div className="font-semibold">{crash.aircraft.aircraftType || 'Generic'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Phase of Flight</div>
          <div className="font-semibold">{crash.phaseOfFlight || 'Unknown'}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Model</div>
          <div className="font-semibold">{crash.aircraft.model}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Manufacturer</div>
          <div className="font-semibold">{crash.aircraft.manufacturer}</div>
        </div>
      </div>
    </div>
  );
}

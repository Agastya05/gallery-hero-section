import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Sculpture
 * ---------
 * A reusable plinth + abstract geometric sculpture pairing for the
 * Sculpture Court. Uses simple primitive geometry (no external 3D models
 * required). Rotates at an imperceptibly slow rate — just enough to catch
 * the light differently as the viewer passes, never enough to feel gimmicky.
 */
export default function Sculpture({
  position = [0, 0, 0],
  scale = 1,
  color = '#8a7a5c',
  rotationSpeed = 0.05,
  plinthColor = '#e9e5da',
}) {
  const sculptureRef = useRef();

  useFrame((_, delta) => {
    if (sculptureRef.current) {
      sculptureRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 1, 32]} />
        <meshStandardMaterial color={plinthColor} roughness={0.45} metalness={0.02} />
      </mesh>
      <group ref={sculptureRef} position={[0, 1.35, 0]}>
        <mesh castShadow>
          <torusKnotGeometry args={[0.28, 0.09, 128, 16]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * VolumetricRay
 * -------------
 * A lightweight, original approximation of a volumetric light shaft using
 * a soft, additive-blended cone mesh rather than a costly raymarched
 * shader — keeps the "light beams through dusty museum air" mood at a
 * fraction of the GPU cost, important for 60fps with several active at once.
 */
export default function VolumetricRay({ position = [0, 4, 0], height = 4, radius = 1.1, opacity = 0.06, color = '#fff4da' }) {
  const geometry = useMemo(() => new THREE.ConeGeometry(radius, height, 32, 1, true), [radius, height]);

  return (
    <mesh position={position} geometry={geometry} rotation={[Math.PI, 0, 0]}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

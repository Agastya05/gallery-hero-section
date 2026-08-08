import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PointerParallax
 * ----------------
 * Adds a very subtle rotational offset to the camera based on pointer
 * position — the feeling of a visitor's head gently turning to take in a
 * room — layered on top of the scroll-driven walkthrough path. Disabled
 * in effect on touch devices since there's no meaningful hover pointer.
 */
export default function PointerParallax({ strength = 0.035 }) {
  const { camera, gl } = useThree();
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(e) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current.x = nx;
      target.current.y = ny;
    }
    gl.domElement.addEventListener('pointermove', handlePointerMove);
    return () => gl.domElement.removeEventListener('pointermove', handlePointerMove);
  }, [gl]);

  useFrame((_, delta) => {
    current.current.x = THREE.MathUtils.damp(current.current.x, target.current.x, 2.4, delta);
    current.current.y = THREE.MathUtils.damp(current.current.y, target.current.y, 2.4, delta);

    camera.rotation.y += current.current.x * strength * delta * 6;
    camera.rotation.x += -current.current.y * strength * 0.6 * delta * 6;
  });

  return null;
}

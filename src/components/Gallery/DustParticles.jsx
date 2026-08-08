import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * DustParticles
 * -------------
 * Instanced points drifting almost imperceptibly through a room's air,
 * catching the spotlight beams. Scoped to a given Z span (zStart/zEnd) so
 * each room can have its own contained batch, and count is configurable
 * per useDeviceTier so it scales down on lower-tier devices.
 */
export default function DustParticles({ count = 60, zStart = 0, zEnd = -6, xSpread = 4, color = '#f4ecd8' }) {
  const pointsRef = useRef();
  const depth = zStart - zEnd;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * xSpread;
      arr[i * 3 + 1] = Math.random() * 3.6;
      arr[i * 3 + 2] = zStart - Math.random() * depth;
    }
    return arr;
  }, [count, zStart, depth, xSpread]);

  const speeds = useMemo(
    () => new Float32Array(count).map(() => 0.02 + Math.random() * 0.05),
    [count]
  );

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i);
      const newY = y + speeds[i] * 0.016;
      posAttr.setY(i, newY > 3.6 ? 0 : newY);
      const x = posAttr.getX(i);
      posAttr.setX(i, x + Math.sin(state.clock.elapsedTime * 0.1 + i) * 0.0006);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.01} color={color} transparent opacity={0.32} sizeAttenuation depthWrite={false} />
    </points>
  );
}

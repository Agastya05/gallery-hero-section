import { useRef } from 'react';
import { SpotLight } from '@react-three/drei';

/**
 * GallerySpotlight
 * -----------------
 * Wraps drei's SpotLight with defaults tuned for soft museum-style
 * lighting. Color and intensity are passed per-room from roomsConfig so
 * each gallery gets its own distinct lighting character (warm gold in the
 * Painted Wing, cool blue-white in the Sculpture Court, flat neutral in
 * Photography, etc).
 */
export default function GallerySpotlight({
  position = [0, 3.6, 0],
  target = [0, 1.4, 0],
  intensity = 8,
  color = '#ffdcae',
  angle = 0.5,
  penumbra = 0.8,
  distance = 9,
}) {
  const lightRef = useRef();

  return (
    <SpotLight
      ref={lightRef}
      position={position}
      target-position={target}
      angle={angle}
      penumbra={penumbra}
      intensity={intensity}
      color={color}
      distance={distance}
      castShadow
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.0005}
      attenuation={5}
      anglePower={4}
    />
  );
}

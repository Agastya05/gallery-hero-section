import { Environment } from '@react-three/drei';

/**
 * LightingRig
 * -----------
 * Base illumination for the whole hall. Deliberately kept a little
 * brighter and more neutral than a typical "moody" 3D scene — real
 * high-end galleries are evenly, generously lit so the art reads
 * accurately; heavy contrast/crushed shadows would fight that. Per-room
 * *color* mood still comes from GallerySpotlight + RoomFillLight; this
 * rig only sets the overall exposure floor.
 */
export default function LightingRig() {
  return (
    <>
      <Environment preset="apartment" environmentIntensity={0.44} />
      {/* Bounce colour lifted off near-black so shadowed surfaces settle at a
          soft stone tone instead of crushing to nothing. */}
      <hemisphereLight args={['#f3efe4', '#6a6353', 0.68]} />
      <ambientLight intensity={0.32} color="#fff8ec" />
    </>
  );
}

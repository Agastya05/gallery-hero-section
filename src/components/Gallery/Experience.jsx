import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import CameraRig from '../Camera/CameraRig';
import PointerParallax from '../Camera/PointerParallax';
import GalleryScene from './GalleryScene';
import { ROOMS } from '../../lib/roomsConfig';
import { useDeviceTier } from '../../hooks/useDeviceTier';

/**
 * Experience
 * ----------
 * Top-level R3F <Canvas> wrapper. Responsible for renderer configuration,
 * device-tier-aware quality settings, and composing the camera rig with
 * the multi-room gallery scene.
 */
export default function Experience() {
  const { dpr, particleCount, enableBloom, tier } = useDeviceTier();

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.6, ROOMS[0].zStart + 5], fov: 42, near: 0.1, far: 70 }}
    >
      <color attach="background" args={['#4a443b']} />
      <Suspense fallback={null}>
        <CameraRig>
          <PointerParallax />
          <GalleryScene tier={tier} particleCount={particleCount} />
        </CameraRig>
        {enableBloom && (
          <EffectComposer multisampling={0} disableNormalPass>
            <Bloom intensity={0.16} luminanceThreshold={0.85} luminanceSmoothing={0.4} mipmapBlur />
            {/* Light touch — a heavy vignette was a big part of what made the
                walkthrough read as high-contrast. */}
            <Vignette eskil={false} offset={0.42} darkness={0.2} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}

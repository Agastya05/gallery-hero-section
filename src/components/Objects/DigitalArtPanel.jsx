import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * DigitalArtPanel
 * ---------------
 * A backlit screen showing a real digital work from the Zigguratss
 * catalogue. The image is used as both the diffuse and the emissive map, so
 * the panel genuinely lights the wall around it — which is how a
 * screen-based gallery is normally lit — while a slow breathing of the
 * emissive intensity keeps it feeling alive rather than like a print.
 *
 * Size is authored by *height*; width follows the image's aspect ratio.
 */
export default function DigitalArtPanel({
  artwork,
  position = [0, 1.7, 0],
  rotation = [0, 0, 0],
  height = 1.0,
  glow = '#8fc7dd',
}) {
  const materialRef = useRef();

  const texture = useTexture(artwork.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  // Plaque with the real credit line, matching the framed rooms.
  const plaqueTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#22252b';
    ctx.fillRect(0, 0, 512, 128);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#e8edf2';
    let titleSize = 32;
    do {
      ctx.font = `500 ${titleSize}px Georgia, serif`;
      titleSize -= 2;
    } while (ctx.measureText(artwork.title).width > 468 && titleSize > 16);
    ctx.fillText(artwork.title, 256, 52);

    ctx.font = 'italic 300 24px Georgia, serif';
    ctx.fillStyle = '#9fb0bd';
    ctx.fillText(`${artwork.artist} · ${artwork.medium}`, 256, 92);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [artwork.title, artwork.artist, artwork.medium]);

  useFrame((state) => {
    if (!materialRef.current) return;
    // Gentle backlight breathing — a screen at rest, not a flicker.
    materialRef.current.emissiveIntensity =
      0.62 + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.06;
  });

  const h = height;
  const w = height * artwork.aspect;

  return (
    <group position={position} rotation={rotation}>
      {/* Thin bezel */}
      <mesh castShadow>
        <boxGeometry args={[w + 0.07, h + 0.07, 0.05]} />
        <meshStandardMaterial color="#3c3a38" roughness={0.45} metalness={0.5} />
      </mesh>

      {/* Emissive screen surface — this mesh lights the surrounding area */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          ref={materialRef}
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.62}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, -h / 2 - 0.17, 0.03]}>
        <planeGeometry args={[0.5, 0.125]} />
        <meshStandardMaterial map={plaqueTexture} roughness={0.6} />
      </mesh>

      {/* Soft point light matching the screen's glow, subtly colors the room */}
      <pointLight position={[0, 0, 0.7]} intensity={1.1} distance={4} color={glow} />
    </group>
  );
}

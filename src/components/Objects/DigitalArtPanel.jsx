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
  onPointerEnter,
}) {
  const materialRef = useRef();

  const texture = useTexture(artwork.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  const textureAspect = useMemo(() => {
    const image = texture.image;
    const width = image?.naturalWidth || image?.videoWidth || image?.width;
    const height = image?.naturalHeight || image?.videoHeight || image?.height;
    return width && height ? width / height : artwork.aspect;
  }, [texture.image, artwork.aspect]);

  // Plaque with the real credit line, matching the framed rooms.
  const plaqueTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 154;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#22252b';
    ctx.fillRect(0, 0, 640, 154);
    ctx.strokeStyle = 'rgba(232,237,242,0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 620, 134);
    ctx.textAlign = 'center';

    ctx.fillStyle = '#e8edf2';
    let titleSize = 38;
    do {
      ctx.font = `500 ${titleSize}px Georgia, serif`;
      titleSize -= 2;
    } while (ctx.measureText(artwork.title).width > 572 && titleSize > 18);
    ctx.fillText(artwork.title, 320, 62);

    ctx.font = 'italic 300 29px Georgia, serif';
    ctx.fillStyle = '#9fb0bd';
    ctx.fillText(`${artwork.artist} · ${artwork.medium}`, 320, 106);

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
  const w = height * textureAspect;

  return (
    <group position={position} rotation={rotation} onPointerEnter={onPointerEnter}>
      <mesh position={[0.035, -0.035, -0.006]}>
        <planeGeometry args={[w + 0.16, h + 0.16]} />
        <meshBasicMaterial color="#0d1117" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {/* Thin bezel */}
      <mesh castShadow>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.055]} />
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

      <mesh position={[0, -h / 2 - 0.2, 0.03]}>
        <planeGeometry args={[0.72, 0.174]} />
        <meshStandardMaterial map={plaqueTexture} roughness={0.6} />
      </mesh>

      {/* Soft point light matching the screen's glow, subtly colors the room */}
      <pointLight position={[0, 0, 0.7]} intensity={1.1} distance={4} color={glow} />
    </group>
  );
}

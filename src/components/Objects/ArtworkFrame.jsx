import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../../lib/scrollStore';

/**
 * ArtworkFrame
 * ------------
 * A framed work on a wall — used by the Painted Wing, the Sculpture Court's
 * wall pieces, the Photography Hall, Works on Paper and the finale.
 *
 * It now hangs real pieces from the Zigguratss catalogue (see
 * artworksConfig.js) rather than the old "Image coming soon" cards. Each one
 * gets a proper museum treatment: a mid-tone frame, an ivory mount board
 * around the image, and a wall plaque carrying the real title, artist and
 * medium.
 *
 * Sizing is authored by *height* only — width comes from the source image's
 * aspect ratio, so a landscape photograph and a tall drawing both hang
 * correctly without anyone hand-tuning two numbers per piece.
 *
 * depthFactor controls how strongly this object parallaxes relative to
 * scroll progress — foreground pieces should use a higher value than
 * background pieces to sell the sense of scale/depth.
 */
export default function ArtworkFrame({
  artwork,
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  height = 1.35,
  depthFactor = 0.15,
  frameColor = '#4b443b',
  mountColor = '#efe9dc',
}) {
  const groupRef = useRef();
  const progress = useScrollStore((s) => s.progress);
  const basePos = useMemo(() => new THREE.Vector3(...position), [position]);

  const texture = useTexture(artwork.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  // Wall plaque: title, artist, medium — the same information the piece
  // carries on its catalogue page.
  const plaqueTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f2ede0';
    ctx.fillRect(0, 0, 512, 160);

    // Titles vary a lot in length; shrink to fit rather than overflow.
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2a251d';
    let titleSize = 34;
    do {
      ctx.font = `500 ${titleSize}px Georgia, serif`;
      titleSize -= 2;
    } while (ctx.measureText(artwork.title).width > 468 && titleSize > 16);
    ctx.fillText(artwork.title, 256, 56);

    ctx.font = 'italic 300 26px Georgia, serif';
    ctx.fillStyle = '#5c5445';
    ctx.fillText(artwork.artist, 256, 96);

    ctx.font = '300 21px Arial, sans-serif';
    ctx.fillStyle = '#8a8172';
    ctx.fillText(artwork.medium, 256, 130);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [artwork.title, artwork.artist, artwork.medium]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const offset = progress * depthFactor * 2.0;
    const targetZ = basePos.z + offset;
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      2.5,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      basePos.y + Math.sin(state.clock.elapsedTime * 0.4 + basePos.x) * 0.015,
      2,
      delta
    );
  });

  const h = height;
  const w = height * artwork.aspect;
  const mount = 0.07; // ivory mount board visible around the image
  const lip = 0.05; // frame moulding beyond the mount

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Frame moulding */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + (mount + lip) * 2, h + (mount + lip) * 2, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.15} />
      </mesh>

      {/* Mount board */}
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[w + mount * 2, h + mount * 2]} />
        <meshStandardMaterial color={mountColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* The work itself */}
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
      </mesh>

      {/* Museum plaque, hung just below the frame */}
      <mesh position={[0, -h / 2 - mount - lip - 0.15, 0.032]}>
        <planeGeometry args={[0.5, 0.156]} />
        <meshStandardMaterial map={plaqueTexture} roughness={0.65} />
      </mesh>
    </group>
  );
}

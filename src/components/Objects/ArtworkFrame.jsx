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
  onPointerEnter,
}) {
  const groupRef = useRef();
  const progress = useScrollStore((s) => s.progress);
  const basePos = useMemo(() => new THREE.Vector3(...position), [position]);

  const texture = useTexture(artwork.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  const textureAspect = useMemo(() => {
    const image = texture.image;
    const width = image?.naturalWidth || image?.videoWidth || image?.width;
    const height = image?.naturalHeight || image?.videoHeight || image?.height;
    return width && height ? width / height : artwork.aspect;
  }, [texture.image, artwork.aspect]);

  // Wall plaque: title, artist, medium — the same information the piece
  // carries on its catalogue page.
  const plaqueTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f2ede0';
    ctx.fillRect(0, 0, 640, 190);
    ctx.strokeStyle = 'rgba(42,37,29,0.18)';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 620, 170);

    // Titles vary a lot in length; shrink to fit rather than overflow.
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2a251d';
    let titleSize = 40;
    do {
      ctx.font = `500 ${titleSize}px Georgia, serif`;
      titleSize -= 2;
    } while (ctx.measureText(artwork.title).width > 572 && titleSize > 18);
    ctx.fillText(artwork.title, 320, 67);

    ctx.font = 'italic 300 31px Georgia, serif';
    ctx.fillStyle = '#5c5445';
    ctx.fillText(artwork.artist, 320, 116);

    ctx.font = '300 25px Arial, sans-serif';
    ctx.fillStyle = '#8a8172';
    ctx.fillText(artwork.medium, 320, 154);

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
  const w = height * textureAspect;
  const mount = 0.085; // ivory mount board visible around the image
  const lip = 0.065; // frame moulding beyond the mount

  return (
    <group ref={groupRef} position={position} rotation={rotation} onPointerEnter={onPointerEnter}>
      <mesh position={[0.035, -0.035, -0.006]} receiveShadow>
        <planeGeometry args={[w + (mount + lip) * 2.18, h + (mount + lip) * 2.18]} />
        <meshBasicMaterial color="#1e1a14" transparent opacity={0.18} depthWrite={false} />
      </mesh>

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

      <mesh position={[0, 0, 0.033]}>
        <planeGeometry args={[w + 0.025, h + 0.025]} />
        <meshBasicMaterial color="#231f19" transparent opacity={0.14} />
      </mesh>

      {/* The work itself */}
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
      </mesh>

      {/* Museum plaque, hung just below the frame */}
      <mesh position={[0, -h / 2 - mount - lip - 0.18, 0.032]}>
        <planeGeometry args={[0.72, 0.214]} />
        <meshStandardMaterial map={plaqueTexture} roughness={0.65} />
      </mesh>
    </group>
  );
}

import { useMemo } from 'react';
import * as THREE from 'three';
import { ROOMS, THRESHOLD_CONST } from '../../lib/roomsConfig';

const ROOM_WIDTH = 11.5;
const HALL_WIDTH = 3.2; // narrower connecting threshold, reads as a "doorway"
const CEILING_HEIGHT = 4.2;
const DOOR_HEIGHT = 3.0;
// The first room is entered head-on from outside, so its opening is a wide
// gallery portal rather than a doorway — it frames the hero's opening shot.
const PORTAL_WIDTH = 7.4;
const PORTAL_HEIGHT = 3.5;

/** Off-white / warm-ivory base tones used for floor and ceiling in every
 *  normally-lit room, plus darker equivalents for the two moodier "dark"
 *  rooms. Kept as flat constants (rather than derived per-room tints) so
 *  the architecture always reads as bright, clean gallery stone/plaster —
 *  per-room color identity still comes through via wall color, spotlight
 *  tint, and the room's fill light. */
const FLOOR_OFFWHITE = '#f4efe3';
const CEILING_OFFWHITE = '#f8f4ea';
// Deliberately mid-tone rather than near-black: the two low-key rooms should
// read a stop or two below the ivory ones, not as a hard cut to darkness.
const FLOOR_DARK = '#6a6153';
const CEILING_DARK = '#6f665a';

/**
 * Generates a subtle procedural marble/stone-veined floor texture, tinted
 * per room so each gallery has its own distinct floor tone without needing
 * any external texture files. Kept light and low-contrast so the floor
 * reads as bright, polished stone rather than a dark void underfoot.
 */
function makeFloorTexture(tint) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 1.4;
    ctx.moveTo(Math.random() * 512, 0);
    ctx.bezierCurveTo(Math.random() * 512, 170, Math.random() * 512, 340, Math.random() * 512, 512);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(30,26,18,0.06)';
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * 1.2;
    ctx.moveTo(Math.random() * 512, 0);
    ctx.bezierCurveTo(Math.random() * 512, 170, Math.random() * 512, 340, Math.random() * 512, 512);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * EndWall
 * -------
 * A full-width wall closing off one end of a room, with an opening cut into
 * it — two side panels plus a lintel over the gap.
 *
 * This replaced a single 4.4-wide panel floating in an 11.5-wide room, which
 * left the space either side of it open onto nothing: from inside a room you
 * were looking past the "far wall" straight into empty background, and that
 * gap read as a hard dark frame around every doorway. Closing the wall
 * properly is most of what removed the black banding between rooms.
 *
 * Rendered double-sided so the same wall works whether you're approaching it
 * from inside the room or from the threshold on the other side.
 */
function EndWall({ z, color, doorWidth = HALL_WIDTH, doorHeight = DOOR_HEIGHT }) {
  const sideWidth = (ROOM_WIDTH - doorWidth) / 2;
  const lintelHeight = CEILING_HEIGHT - doorHeight;
  const sideOffset = doorWidth / 2 + sideWidth / 2;

  return (
    <group position={[0, 0, z]}>
      {sideWidth > 0.01 && (
        <>
          <mesh position={[-sideOffset, CEILING_HEIGHT / 2, 0]} receiveShadow>
            <planeGeometry args={[sideWidth, CEILING_HEIGHT]} />
            <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[sideOffset, CEILING_HEIGHT / 2, 0]} receiveShadow>
            <planeGeometry args={[sideWidth, CEILING_HEIGHT]} />
            <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {lintelHeight > 0.01 && (
        <mesh position={[0, doorHeight + lintelHeight / 2, 0]} receiveShadow>
          <planeGeometry args={[doorWidth, lintelHeight]} />
          <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/**
 * RoomShell
 * ---------
 * Floor / walls / ceiling for a single themed room. Floor keeps a subtle
 * procedural stone texture; ceiling is a flat, solid off-white (or dark,
 * for moodier rooms) matte plane — simple architectural surfaces that
 * read as clean gallery construction rather than a patterned/blank void.
 */
function RoomShell({ room, isFirst, isLast }) {
  const floorBase = room.dark ? FLOOR_DARK : FLOOR_OFFWHITE;
  const ceilingBase = room.dark ? CEILING_DARK : CEILING_OFFWHITE;

  const floorTex = useMemo(() => makeFloorTexture(floorBase), [floorBase]);

  const depth = room.zStart - room.zEnd;
  const centerZ = room.zCenter;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, depth]} />
        <meshStandardMaterial map={floorTex} roughness={room.dark ? 0.55 : 0.34} metalness={0.04} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEILING_HEIGHT, centerZ]}>
        <planeGeometry args={[ROOM_WIDTH, depth]} />
        <meshStandardMaterial color={ceilingBase} roughness={0.95} metalness={0} />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_WIDTH / 2, CEILING_HEIGHT / 2, centerZ]} receiveShadow>
        <planeGeometry args={[depth, CEILING_HEIGHT]} />
        <meshStandardMaterial color={room.wallColor} roughness={room.dark ? 0.6 : 0.85} />
      </mesh>

      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_WIDTH / 2, CEILING_HEIGHT / 2, centerZ]} receiveShadow>
        <planeGeometry args={[depth, CEILING_HEIGHT]} />
        <meshStandardMaterial color={room.wallColor} roughness={room.dark ? 0.6 : 0.85} />
      </mesh>

      {/* Near end: a wide portal for the first room (the hero's opening
          shot looks straight through it), a plain doorway for the rest. */}
      <EndWall
        z={room.zStart + 0.05}
        color={room.wallColor}
        doorWidth={isFirst ? PORTAL_WIDTH : HALL_WIDTH}
        doorHeight={isFirst ? PORTAL_HEIGHT : DOOR_HEIGHT}
      />

      {/* Far end: a doorway through to the next room, or a solid wall if
          this is the last room in the hall. */}
      <EndWall
        z={room.zEnd - 0.05}
        color={room.wallColor}
        doorWidth={isLast ? 0 : HALL_WIDTH}
      />

      {/* Soft, wide uplight-style wash so both floor and ceiling catch
          ambient brightness even where no spotlight cone reaches directly. */}
      <pointLight position={[0, 3.6, centerZ]} intensity={room.dark ? 0.95 : 1.3} distance={9.5} decay={1.3} color={room.ambientColor} />
      <pointLight position={[0, 0.4, centerZ]} intensity={room.dark ? 0.62 : 0.55} distance={8.5} decay={1.4} color={room.ambientColor} />
    </group>
  );
}

/**
 * Threshold
 * ---------
 * A short, narrower doorway segment connecting two rooms — visually reads
 * as "stepping through" from one gallery into the next.
 *
 * These used to be near-black (#17140f walls on a #100e0b ceiling, lit at
 * 0.3), which put a hard black band between every pair of brightly-lit
 * rooms and made the whole walk read as high-contrast. They're now warm
 * mid-stone and properly lit: the narrower width and the half-stop drop in
 * tone are enough to sell "doorway" without the darkness.
 */
function Threshold({ zStart, zEnd }) {
  const depth = zStart - zEnd;
  const centerZ = (zStart + zEnd) / 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, depth]} />
        <meshStandardMaterial color="#867c6e" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-HALL_WIDTH / 2, CEILING_HEIGHT / 2, centerZ]}>
        <planeGeometry args={[depth, CEILING_HEIGHT]} />
        <meshStandardMaterial color="#b8ae9c" roughness={0.85} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[HALL_WIDTH / 2, CEILING_HEIGHT / 2, centerZ]}>
        <planeGeometry args={[depth, CEILING_HEIGHT]} />
        <meshStandardMaterial color="#b8ae9c" roughness={0.85} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CEILING_HEIGHT, centerZ]}>
        <planeGeometry args={[HALL_WIDTH, depth]} />
        <meshStandardMaterial color="#aca295" roughness={0.95} />
      </mesh>
      <pointLight position={[0, 2.8, centerZ]} intensity={1.2} distance={7} decay={1.4} color="#ffe9c8" />
    </group>
  );
}

/**
 * GalleryHall
 * -----------
 * The architectural shell for the entire visit: iterates ROOMS and renders
 * one distinctly-toned RoomShell per theme, connected by narrow Threshold
 * doorway segments — giving the "hallway leading to different rooms"
 * structure the client asked for, entirely data-driven from roomsConfig.js.
 */
export default function GalleryHall() {
  return (
    <group>
      {ROOMS.map((room, i) => (
        <group key={room.id}>
          <RoomShell room={room} isFirst={i === 0} isLast={i === ROOMS.length - 1} />
          {i < ROOMS.length - 1 && (
            <Threshold zStart={room.zEnd} zEnd={room.zEnd - THRESHOLD_CONST} />
          )}
        </group>
      ))}
    </group>
  );
}

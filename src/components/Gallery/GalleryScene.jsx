import { memo, useCallback, useMemo, useState } from 'react';
import GalleryHall from './GalleryHall';
import LightingRig from './LightingRig';
import GallerySpotlight from './GallerySpotlight';
import RoomFillLight from './RoomFillLight';
import DustParticles from './DustParticles';
import VolumetricRay from './VolumetricRay';
import ArtworkFrame from '../Objects/ArtworkFrame';
import Sculpture from '../Objects/Sculpture';
import DigitalArtPanel from '../Objects/DigitalArtPanel';
import { ROOMS } from '../../lib/roomsConfig';
import { ARTWORKS } from '../../lib/artworksConfig';

/**
 * Room content renderers
 * ----------------------
 * Each themed room places a small, deliberately curated set of pieces —
 * generally two flanking works plus one feature piece at the far wall —
 * rather than crowding every surface. Every piece is a real work from the
 * Zigguratss catalogue (see artworksConfig.js); frames are authored by
 * height only and take their width from the source image's aspect ratio.
 *
 * Note on lighting: per client direction, the Painted Wing no longer uses
 * dedicated ceiling spotlight fixtures — it relies entirely on the room's
 * even ambient wash (RoomFillLight + GalleryHall's uplights). The
 * Sculpture Court is the one room that keeps directional spotlight
 * fixtures, since sculpture in the round benefits from a defined key
 * light in a way flat wall pieces don't. Every other themed room keeps
 * its original spotlighting.
 *
 * A note on `featureX`: every room but the last has a doorway punched through
 * the middle of its far wall (GalleryHall's EndWall), and the camera leaves
 * through it. A feature piece hung dead centre therefore sat in the opening
 * with the camera flying straight through it. Each one now hangs on the solid
 * panel beside the doorway, on the side the camera is already turned toward
 * at room centre — clear of the exit, and in frame for the whole approach.
 * The finale's far wall is solid, so its piece stays centred.
 */
const SIDE_WALL_X = 5.68;
const FAR_WALL_OFFSET = 0.15;
const FAR_WALL_PANEL_X = 3.55;
const WALL_TOP_Y = 4.2;
const ART_TOP_GAP = 0.55;
const FRAME_OUTER_PAD = 0.24;
const DIGITAL_OUTER_PAD = 0.07;
const ALL_ARTWORKS = Object.values(ARTWORKS).flat();
const ARTWORK_SLOT_KEYS = [
  'paintings-left',
  'paintings-right',
  'paintings-feature',
  'sculpture-wall',
  'sculpture-side',
  'digital-left',
  'digital-right',
  'digital-feature',
  'photography-left',
  'photography-right',
  'photography-feature',
  'paper-left',
  'paper-right',
  'paper-feature',
  'finale-feature',
];
const featureX = (room) =>
  room.index < ROOMS.length - 1 ? -room.side * FAR_WALL_PANEL_X : 0;
const sideWallPosition = (side, y, z) => [side * SIDE_WALL_X, y, z];
const sideWallRotation = (side) => [0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0];
const farWallPosition = (x, y, zEnd, offset = FAR_WALL_OFFSET) => [x, y, zEnd + offset];
const artworkCenterY = (height, outerPad = FRAME_OUTER_PAD) =>
  WALL_TOP_Y - ART_TOP_GAP - (height + outerPad) / 2;
const frameY = (height) => artworkCenterY(height, FRAME_OUTER_PAD);
const digitalY = (height) => artworkCenterY(height, DIGITAL_OUTER_PAD);

function shuffledArtworks() {
  const items = [...ALL_ARTWORKS];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function DynamicArtworkFrame({ artwork, slotKey, getArtwork, cycleArtworks, ...props }) {
  return (
    <ArtworkFrame
      artwork={getArtwork(slotKey) || artwork}
      onPointerEnter={cycleArtworks}
      {...props}
    />
  );
}

function DynamicDigitalArtPanel({ artwork, slotKey, getArtwork, cycleArtworks, ...props }) {
  return (
    <DigitalArtPanel
      artwork={getArtwork(slotKey) || artwork}
      onPointerEnter={cycleArtworks}
      {...props}
    />
  );
}

function PaintingsRoomContent({ room, getArtwork, cycleArtworks }) {
  const { zCenter, zEnd } = room;
  const [left, right, feature] = ARTWORKS.paintings;
  const fx = featureX(room);
  const sideHeight = 1.22;
  const featureHeight = 2.08;
  return (
    <>
      <DynamicArtworkFrame artwork={left} slotKey={`${room.id}-left`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={sideWallPosition(-1, frameY(sideHeight), zCenter + 1.05)} rotation={sideWallRotation(-1)} height={sideHeight} depthFactor={0} frameColor="#5a5044" />
      <DynamicArtworkFrame artwork={right} slotKey={`${room.id}-right`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={sideWallPosition(1, frameY(sideHeight), zCenter - 1.05)} rotation={sideWallRotation(1)} height={sideHeight} depthFactor={0} frameColor="#5a5044" />
      <DynamicArtworkFrame artwork={feature} slotKey={`${room.id}-feature`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={farWallPosition(fx, frameY(featureHeight), zEnd)} height={featureHeight} depthFactor={0} frameColor="#5a5044" />
    </>
  );
}

function SculptureRoomContent({ room, getArtwork, cycleArtworks }) {
  const { zStart, zCenter, zEnd } = room;
  const [wallPiece, sidePiece] = ARTWORKS.sculpture;
  const fx = featureX(room);
  const wallHeight = 1.68;
  const sideHeight = 1.34;
  return (
    <>
      <Sculpture position={[-1.5, 0, zStart - 1.6]} color="#a98c5c" scale={0.85} />
      <Sculpture position={[1.6, 0, zEnd + 1.6]} color="#8f8f8f" scale={0.72} rotationSpeed={-0.04} />

      {/* Work in the round is the subject here; these two mixed-media pieces
          from the same catalogue category hang on the walls around it. */}
      <DynamicArtworkFrame artwork={wallPiece} slotKey={`${room.id}-wall`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={farWallPosition(fx, frameY(wallHeight), zEnd)} height={wallHeight} depthFactor={0} frameColor="#5f574c" />
      <DynamicArtworkFrame artwork={sidePiece} slotKey={`${room.id}-side`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={sideWallPosition(-1, frameY(sideHeight), zCenter)} rotation={sideWallRotation(-1)} height={sideHeight} depthFactor={0} frameColor="#5f574c" />

      {/* Sculpture Court keeps dedicated ceiling spotlight fixtures */}
      <GallerySpotlight position={[-1.5, 3.9, zStart - 1.1]} target={[-1.5, 1.2, zStart - 1.6]} color={room.lightColor} intensity={room.lightIntensity} angle={0.55} penumbra={1} />
      <GallerySpotlight position={[1.6, 3.9, zEnd + 2.1]} target={[1.6, 1.2, zEnd + 1.6]} color={room.lightColor} intensity={room.lightIntensity} angle={0.55} penumbra={1} />
      <GallerySpotlight position={[0, 3.9, zCenter]} target={[0, 0.6, zCenter]} color={room.lightColor} intensity={room.lightIntensity * 0.5} angle={0.65} penumbra={1} />
    </>
  );
}

function DigitalRoomContent({ room, getArtwork, cycleArtworks }) {
  const { zCenter, zEnd } = room;
  const [left, right, feature] = ARTWORKS.digital;
  const fx = featureX(room);
  const sideHeight = 1.28;
  const featureHeight = 1.72;
  const featurePosition = farWallPosition(fx, digitalY(featureHeight), zEnd);
  return (
    <>
      <DynamicDigitalArtPanel artwork={left} slotKey={`${room.id}-left`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={sideWallPosition(-1, digitalY(sideHeight), zCenter + 0.95)} rotation={sideWallRotation(-1)} height={sideHeight} glow={room.accent} />
      <DynamicDigitalArtPanel artwork={right} slotKey={`${room.id}-right`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={sideWallPosition(1, digitalY(sideHeight), zCenter - 0.95)} rotation={sideWallRotation(1)} height={sideHeight} glow={room.accent} />
      <DynamicDigitalArtPanel artwork={feature} slotKey={`${room.id}-feature`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={featurePosition} height={featureHeight} glow={room.accent} />
      {/* Screens are the primary light source here — only a faint rim spot */}
      <GallerySpotlight position={[fx, 3.9, zEnd + 0.9]} target={featurePosition} color={room.lightColor} intensity={1.4} angle={0.58} penumbra={1} />
    </>
  );
}

function PhotographyRoomContent({ room, getArtwork, cycleArtworks }) {
  const { zCenter, zEnd } = room;
  const [left, right, feature] = ARTWORKS.photography;
  const fx = featureX(room);
  const sideHeight = 1.08;
  const featureHeight = 1.42;
  const leftPosition = sideWallPosition(-1, frameY(sideHeight), zCenter + 1.05);
  const rightPosition = sideWallPosition(1, frameY(sideHeight), zCenter - 1.05);
  const featurePosition = farWallPosition(fx, frameY(featureHeight), zEnd);
  return (
    <>
      <DynamicArtworkFrame artwork={left} slotKey={`${room.id}-left`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={leftPosition} rotation={sideWallRotation(-1)} height={sideHeight} depthFactor={0} frameColor="#514e49" />
      <DynamicArtworkFrame artwork={right} slotKey={`${room.id}-right`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={rightPosition} rotation={sideWallRotation(1)} height={sideHeight} depthFactor={0} frameColor="#514e49" />
      <DynamicArtworkFrame artwork={feature} slotKey={`${room.id}-feature`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={featurePosition} height={featureHeight} depthFactor={0} frameColor="#514e49" />

      <GallerySpotlight position={[-4.6, 3.9, zCenter + 1.05]} target={leftPosition} color={room.lightColor} intensity={room.lightIntensity} angle={0.5} penumbra={0.85} />
      <GallerySpotlight position={[4.6, 3.9, zCenter - 1.05]} target={rightPosition} color={room.lightColor} intensity={room.lightIntensity} angle={0.5} penumbra={0.85} />
      <GallerySpotlight position={[fx, 3.9, zEnd + 0.9]} target={featurePosition} color={room.lightColor} intensity={room.lightIntensity + 0.6} angle={0.48} penumbra={0.85} />
    </>
  );
}

function PaperRoomContent({ room, getArtwork, cycleArtworks }) {
  const { zCenter, zEnd } = room;
  const [left, feature, right] = ARTWORKS.paper;
  const fx = featureX(room);
  const sideHeight = 1.22;
  const featureHeight = 1.68;
  const leftPosition = sideWallPosition(-1, frameY(sideHeight), zCenter + 1.05);
  const rightPosition = sideWallPosition(1, frameY(sideHeight), zCenter - 1.05);
  const featurePosition = farWallPosition(fx, frameY(featureHeight), zEnd);
  return (
    <>
      <DynamicArtworkFrame artwork={left} slotKey={`${room.id}-left`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={leftPosition} rotation={sideWallRotation(-1)} height={sideHeight} depthFactor={0} frameColor="#6b5842" />
      <DynamicArtworkFrame artwork={right} slotKey={`${room.id}-right`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={rightPosition} rotation={sideWallRotation(1)} height={sideHeight} depthFactor={0} frameColor="#6b5842" />
      <DynamicArtworkFrame artwork={feature} slotKey={`${room.id}-feature`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={featurePosition} height={featureHeight} depthFactor={0} frameColor="#6b5842" />

      <GallerySpotlight position={[-4.7, 3.9, zCenter + 1.05]} target={leftPosition} color={room.lightColor} intensity={room.lightIntensity} angle={0.52} penumbra={1} />
      <GallerySpotlight position={[4.7, 3.9, zCenter - 1.05]} target={rightPosition} color={room.lightColor} intensity={room.lightIntensity} angle={0.52} penumbra={1} />
      <GallerySpotlight position={[fx, 3.9, zEnd + 1.2]} target={featurePosition} color={room.lightColor} intensity={room.lightIntensity} angle={0.58} penumbra={1} />
    </>
  );
}

function FinaleRoomContent({ room, getArtwork, cycleArtworks }) {
  const { zCenter, zEnd } = room;
  const [feature] = ARTWORKS.finale;
  const featureHeight = 2.18;
  const featurePosition = farWallPosition(0, frameY(featureHeight), zEnd);
  return (
    <>
      {/* A single feature piece, deliberately isolated to close the walkthrough */}
      <DynamicArtworkFrame artwork={feature} slotKey={`${room.id}-feature`} getArtwork={getArtwork} cycleArtworks={cycleArtworks} position={featurePosition} height={featureHeight} depthFactor={0} frameColor="#6a5b45" />

      <GallerySpotlight position={[0, 3.9, zEnd + 1.3]} target={featurePosition} color={room.lightColor} intensity={room.lightIntensity} angle={0.44} penumbra={1} distance={11} />
      <VolumetricRay position={[0, 4, zEnd + 1.1]} radius={1.2} height={4.2} color={room.lightColor} opacity={0.03} />
      {/* Faint ambient wash so the approach into the room isn't pitch black */}
      <GallerySpotlight position={[0, 3.9, zCenter]} target={[0, 0.6, zCenter]} color={room.lightColor} intensity={room.lightIntensity * 0.4} angle={0.7} penumbra={1} />
    </>
  );
}

const CONTENT_BY_ID = {
  paintings: PaintingsRoomContent,
  sculpture: SculptureRoomContent,
  digital: DigitalRoomContent,
  photography: PhotographyRoomContent,
  paper: PaperRoomContent,
  finale: FinaleRoomContent,
};

/**
 * GalleryScene
 * ------------
 * Composes the full 3D environment: architecture (GalleryHall), a single
 * neutral base lighting rig, and — for every room defined in
 * roomsConfig.js — that room's tinted fill light plus its themed content.
 * Wrapped in React.memo since nothing here needs to re-render on scroll;
 * all motion happens inside individual components via useFrame.
 *
 * @param {object} props
 * @param {'low'|'high'} props.tier - device performance tier for graceful degradation
 * @param {number} props.particleCount - dust particles per room (from useDeviceTier)
 */
function GalleryScene({ tier = 'high', particleCount = 60 }) {
  const [cycleOffset, setCycleOffset] = useState(0);
  const initialArtworks = useMemo(() => shuffledArtworks(), []);
  const getArtwork = useCallback(
    (slotKey) => {
      const slotIndex = ARTWORK_SLOT_KEYS.indexOf(slotKey);
      if (slotIndex === -1) return null;
      return initialArtworks[(slotIndex + cycleOffset) % initialArtworks.length];
    },
    [cycleOffset, initialArtworks]
  );
  const cycleArtworks = useCallback(() => {
    setCycleOffset((offset) => (offset + 1) % initialArtworks.length);
  }, [initialArtworks.length]);

  return (
    <>
      <LightingRig />
      <GalleryHall />

      {ROOMS.map((room) => {
        const Content = CONTENT_BY_ID[room.id];
        return (
          <group key={room.id}>
            <RoomFillLight
              position={[0, 2.2, room.zCenter]}
              color={room.ambientColor}
              // The Painted Wing has no dedicated spotlights, so its fill
              // light runs brighter to properly illuminate the paintings.
              intensity={room.dark ? 0.8 : room.id === 'paintings' ? 1.3 : 0.85}
              distance={11}
            />
            {Content && (
              <Content
                room={room}
                getArtwork={getArtwork}
                cycleArtworks={cycleArtworks}
              />
            )}
            <DustParticles
              count={particleCount}
              zStart={room.zStart}
              zEnd={room.zEnd}
              xSpread={room.dark ? 3.5 : 5.5}
              color={room.dark ? '#bfe8ff' : '#f4ecd8'}
            />
          </group>
        );
      })}

      {/* Distant haze, matching the canvas background for a seamless fade.
          Warm mid-grey and pushed further out than before, so depth reads as
          atmosphere rather than as rooms dropping into blackness. */}
      <fog attach="fog" args={['#4a443b', 22, 62]} />
    </>
  );
}

export default memo(GalleryScene);

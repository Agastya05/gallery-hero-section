import { memo } from 'react';
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
const DOORWAY_CLEARANCE = 2.8;
const featureX = (room) =>
  room.index < ROOMS.length - 1 ? -room.side * DOORWAY_CLEARANCE : 0;

function PaintingsRoomContent({ room }) {
  const { zCenter, zEnd } = room;
  const [left, right, feature] = ARTWORKS.paintings;
  const fx = featureX(room);
  return (
    <>
      <ArtworkFrame artwork={left} position={[-3.6, 1.55, zCenter]} rotation={[0, 0.26, 0]} height={1.0} depthFactor={0.22} frameColor="#5a5044" />
      <ArtworkFrame artwork={right} position={[3.6, 1.55, zCenter]} rotation={[0, -0.26, 0]} height={1.0} depthFactor={0.22} frameColor="#5a5044" />
      <ArtworkFrame artwork={feature} position={[fx, 1.7, zEnd + 0.15]} height={1.85} depthFactor={0.08} frameColor="#5a5044" />
    </>
  );
}

function SculptureRoomContent({ room }) {
  const { zStart, zCenter, zEnd } = room;
  const [wallPiece, sidePiece] = ARTWORKS.sculpture;
  const fx = featureX(room);
  return (
    <>
      <Sculpture position={[-1.5, 0, zStart - 1.6]} color="#a98c5c" scale={0.85} />
      <Sculpture position={[1.6, 0, zEnd + 1.6]} color="#8f8f8f" scale={0.72} rotationSpeed={-0.04} />

      {/* Work in the round is the subject here; these two mixed-media pieces
          from the same catalogue category hang on the walls around it. */}
      <ArtworkFrame artwork={wallPiece} position={[fx, 1.65, zEnd + 0.15]} height={1.5} depthFactor={0.08} frameColor="#5f574c" />
      <ArtworkFrame artwork={sidePiece} position={[-5.68, 1.6, zCenter]} rotation={[0, Math.PI / 2, 0]} height={1.15} depthFactor={0.18} frameColor="#5f574c" />

      {/* Sculpture Court keeps dedicated ceiling spotlight fixtures */}
      <GallerySpotlight position={[-1.5, 3.9, zStart - 1.1]} target={[-1.5, 1.2, zStart - 1.6]} color={room.lightColor} intensity={room.lightIntensity} angle={0.55} penumbra={1} />
      <GallerySpotlight position={[1.6, 3.9, zEnd + 2.1]} target={[1.6, 1.2, zEnd + 1.6]} color={room.lightColor} intensity={room.lightIntensity} angle={0.55} penumbra={1} />
      <GallerySpotlight position={[0, 3.9, zCenter]} target={[0, 0.6, zCenter]} color={room.lightColor} intensity={room.lightIntensity * 0.5} angle={0.65} penumbra={1} />
    </>
  );
}

function DigitalRoomContent({ room }) {
  const { zCenter, zEnd } = room;
  const [left, right, feature] = ARTWORKS.digital;
  const fx = featureX(room);
  return (
    <>
      <DigitalArtPanel artwork={left} position={[-5.68, 1.6, zCenter]} rotation={[0, Math.PI / 2, 0]} height={1.1} glow={room.accent} />
      <DigitalArtPanel artwork={right} position={[5.68, 1.6, zCenter]} rotation={[0, -Math.PI / 2, 0]} height={1.1} glow={room.accent} />
      <DigitalArtPanel artwork={feature} position={[fx, 1.75, zEnd + 0.15]} height={1.5} glow={room.accent} />
      {/* Screens are the primary light source here — only a faint rim spot */}
      <GallerySpotlight position={[fx, 3.9, zEnd + 0.9]} target={[fx, 1.75, zEnd + 0.15]} color={room.lightColor} intensity={1.4} angle={0.55} penumbra={1} />
    </>
  );
}

function PhotographyRoomContent({ room }) {
  const { zCenter, zEnd } = room;
  const [left, right, feature] = ARTWORKS.photography;
  const fx = featureX(room);
  return (
    <>
      <ArtworkFrame artwork={left} position={[-3.4, 1.55, zCenter]} rotation={[0, 0.24, 0]} height={0.8} depthFactor={0.2} frameColor="#514e49" />
      <ArtworkFrame artwork={right} position={[3.4, 1.55, zCenter]} rotation={[0, -0.24, 0]} height={0.8} depthFactor={0.2} frameColor="#514e49" />
      <ArtworkFrame artwork={feature} position={[fx, 1.6, zEnd + 0.15]} height={1.15} depthFactor={0.08} frameColor="#514e49" />

      <GallerySpotlight position={[-3.4, 3.9, zCenter + 0.5]} target={[-3.4, 1.55, zCenter]} color={room.lightColor} intensity={room.lightIntensity} angle={0.46} penumbra={0.85} />
      <GallerySpotlight position={[3.4, 3.9, zCenter + 0.5]} target={[3.4, 1.55, zCenter]} color={room.lightColor} intensity={room.lightIntensity} angle={0.46} penumbra={0.85} />
      <GallerySpotlight position={[fx, 3.9, zEnd + 0.9]} target={[fx, 1.6, zEnd + 0.15]} color={room.lightColor} intensity={room.lightIntensity + 0.6} angle={0.44} penumbra={0.85} />
    </>
  );
}

function PaperRoomContent({ room }) {
  const { zCenter, zEnd } = room;
  const [left, feature, right] = ARTWORKS.paper;
  const fx = featureX(room);
  return (
    <>
      <ArtworkFrame artwork={left} position={[-3.6, 1.5, zCenter]} rotation={[0, 0.26, 0]} height={1.05} depthFactor={0.2} frameColor="#6b5842" />
      <ArtworkFrame artwork={right} position={[3.6, 1.5, zCenter]} rotation={[0, -0.26, 0]} height={1.05} depthFactor={0.2} frameColor="#6b5842" />
      <ArtworkFrame artwork={feature} position={[fx, 1.6, zEnd + 0.15]} height={1.5} depthFactor={0.08} frameColor="#6b5842" />

      <GallerySpotlight position={[-3.6, 3.9, zCenter + 0.5]} target={[-3.6, 1.5, zCenter]} color={room.lightColor} intensity={room.lightIntensity} angle={0.5} penumbra={1} />
      <GallerySpotlight position={[3.6, 3.9, zCenter + 0.5]} target={[3.6, 1.5, zCenter]} color={room.lightColor} intensity={room.lightIntensity} angle={0.5} penumbra={1} />
      <GallerySpotlight position={[fx, 3.9, zEnd + 1.2]} target={[fx, 1.6, zEnd + 0.15]} color={room.lightColor} intensity={room.lightIntensity} angle={0.55} penumbra={1} />
    </>
  );
}

function FinaleRoomContent({ room }) {
  const { zCenter, zEnd } = room;
  const [feature] = ARTWORKS.finale;
  return (
    <>
      {/* A single feature piece, deliberately isolated to close the walkthrough */}
      <ArtworkFrame artwork={feature} position={[0, 1.7, zEnd + 0.4]} height={2.0} depthFactor={0.05} frameColor="#6a5b45" />

      <GallerySpotlight position={[0, 3.9, zEnd + 1.3]} target={[0, 1.7, zEnd + 0.4]} color={room.lightColor} intensity={room.lightIntensity} angle={0.4} penumbra={1} distance={11} />
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
            {Content && <Content room={room} />}
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

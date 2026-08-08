/**
 * roomsConfig.js
 * --------------
 * Single source of truth describing each themed room in the gallery.
 * Both the architecture (GalleryHall), the content (GalleryScene) and the
 * camera path (CameraRig) are derived from this one array so that adding,
 * reordering or re-theming a room only requires editing data here.
 *
 * Layout convention: the hallway runs along -Z. Each room occupies a
 * span of Z from `zStart` (nearest entrance) to `zEnd` (deepest point,
 * more negative). A short, slightly narrower "threshold" gap is left
 * between rooms to sell the feeling of passing through a doorway from
 * one gallery into the next.
 */

const ROOM_DEPTH = 7.2; // slightly deeper rooms = more breathing room around fewer pieces
const THRESHOLD = 1.8;

const ROOM_DEFS = [
  {
    id: 'paintings',
    name: 'The Painted Wing',
    subtitle: 'Contemporary painting',
    wallColor: '#f4ede0', // warm ivory
    floorTint: '#e9dcc4',
    lightColor: '#ffdcae', // warm, soft gold spotlight
    ambientColor: '#f8ecd8',
    accent: '#8a6a3c',
    lightIntensity: 3.6,
  },
  {
    id: 'sculpture',
    name: 'The Sculpture Court',
    subtitle: 'Form, relief & mixed media',
    wallColor: '#ece8df', // warmed stone, less clinically cool
    floorTint: '#ddd6c8',
    lightColor: '#f2ecdd', // soft warm-neutral museum light
    ambientColor: '#efe9dc',
    accent: '#8c8168',
    lightIntensity: 3.8,
  },
  {
    id: 'digital',
    name: 'The Digital Room',
    subtitle: 'Screen-based & digital art',
    // Soft slate rather than near-black: the screens still read as the
    // brightest thing in the room without the walk-in being a hard cut
    // from an ivory room into a black box.
    wallColor: '#565b64',
    floorTint: '#4c4f56',
    lightColor: '#a9cfdf', // restrained cool wash, not neon
    ambientColor: '#535a67',
    accent: '#8fc7dd',
    lightIntensity: 1.9,
    dark: true, // signals GalleryScene/Hall to use emissive-driven lighting
  },
  {
    id: 'photography',
    name: 'The Photography Hall',
    subtitle: 'Fine-art photographic prints',
    wallColor: '#efeeea', // neutral gallery white, warmed slightly
    floorTint: '#dddad2',
    lightColor: '#f3efe6', // soft neutral, not clinical-cold
    ambientColor: '#efece4',
    accent: '#2b2b2b',
    lightIntensity: 3.8,
  },
  {
    id: 'paper',
    name: 'Works on Paper',
    subtitle: 'Drawing & mixed medium',
    wallColor: '#efe4d6', // warm plaster
    floorTint: '#ded0ba',
    lightColor: '#ffd4ab',
    ambientColor: '#f4e6d2',
    accent: '#8a5a3a',
    lightIntensity: 3.2,
  },
  {
    id: 'finale',
    name: 'The Private Collection',
    subtitle: 'A single, final masterwork',
    // Warm graphite — still the quietest, most contained room of the six,
    // but read as stone in low light rather than as an unlit void.
    wallColor: '#4e463c',
    floorTint: '#453e35',
    lightColor: '#f2d9a8',
    ambientColor: '#514639',
    accent: '#c9a25c',
    lightIntensity: 4,
    dark: true,
  },
];

// Compute Z spans for each room automatically from the ordered list above.
let cursor = 6; // entrance starts a few units in front of the camera's start
export const ROOMS = ROOM_DEFS.map((room, i) => {
  const zStart = cursor;
  const zEnd = zStart - ROOM_DEPTH;
  cursor = zEnd - THRESHOLD;
  return {
    ...room,
    index: i,
    zStart,
    zEnd,
    zCenter: (zStart + zEnd) / 2,
    // Which side wall the camera drifts toward on entering this room.
    // CameraRig alternates it per room so the walk reads as a visitor
    // glancing left, then right; GalleryScene reads the same value to hang
    // far-wall pieces clear of the lane the camera leaves through.
    side: i % 2 === 0 ? -1 : 1,
  };
});

export const HALL_TOTAL_LENGTH = ROOMS[0].zStart - ROOMS[ROOMS.length - 1].zEnd + 6;
export const ROOM_DEPTH_CONST = ROOM_DEPTH;
export const THRESHOLD_CONST = THRESHOLD;

/**
 * Which room a given depth along the hall belongs to.
 *
 * The UI read-out is driven from the camera's real Z rather than from scroll
 * progress: CameraRig's path is a Catmull-Rom curve sampled by arc length,
 * with an approach leg plus two stations per room, so progress does not
 * divide evenly into rooms — any formula based on `progress * ROOMS.length`
 * drifts a room ahead in some places and a room behind in others.
 *
 * Rooms run from larger Z to smaller, so the first room whose far end you
 * have not passed yet is the one you are in; while crossing a threshold that
 * resolves to the room you are heading into, which is what you can see.
 */
export function roomIndexForZ(z) {
  for (let i = 0; i < ROOMS.length; i++) {
    if (z >= ROOMS[i].zEnd) return i;
  }
  return ROOMS.length - 1;
}

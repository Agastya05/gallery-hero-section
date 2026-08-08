# Atelier — Cinematic Multi-Room Gallery Hero

An original, scroll-driven 3D hero section for the Zigguratss fine-art
marketplace. The visitor walks down a hallway through a sequence of
**distinct, themed rooms** — painting, sculpture, digital art,
photography, works on paper, and a final private-collection room — each
with its own architecture, color palette, and lighting mood, hanging real
pieces from the Zigguratss catalogue.

**Design note on originality:** this project uses the *interaction
language* of premium editorial/luxury websites (slow cinematic camera
moves, scroll storytelling) purely as a genre reference. No code, shaders,
3D models, or assets from any third-party site were extracted or reused.
All geometry is primitive-based, all environment textures (floors, plaques,
architecture) are generated procedurally at runtime via `<canvas>`, and the
camera path/easing is authored from scratch in `CameraRig.jsx`. The only
external assets are the artwork images themselves, which come from the
client's own catalogue (see below).

## Artwork

The framed pieces are real works from
[zigguratss.com](https://zigguratss.com), listed in
`src/lib/artworksConfig.js` with their true title, artist and medium — the
same credit line that appears on each piece's wall plaque in the scene.

Images live in `public/artworks/`, downsized to 1100px on the long edge and
re-encoded at ~72% quality (≈4 MB for the whole hall). To swap a piece:
drop a new file in that folder, then update its entry — including `aspect`
(source width ÷ height), which is what every frame uses to size itself.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

```bash
npm run build
npm run preview
```

## The room system

Everything about the multi-room layout flows from **one file**:

```
src/lib/roomsConfig.js
```

This defines an ordered array of rooms, each with a wall color, floor
tint, spotlight color, ambient tint, accent color, and a `dark` flag for
screen/feature-lit rooms. Z-depth spans (`zStart`/`zEnd`/`zCenter`) are
computed automatically from a shared `ROOM_DEPTH` + `THRESHOLD` (doorway
gap), so **adding a new room is a single object added to the array** —
architecture, lighting, camera path, scroll length, and the chapter index
in the UI all update automatically.

Current rooms (edit freely):

| # | Room | Theme | Mood |
|---|------|-------|------|
| 1 | The Painted Wing | Painting | Warm ivory walls, gold spotlighting |
| 2 | The Sculpture Court | Sculpture | Warmed stone, museum-neutral light |
| 3 | The Digital Room | Digital / screen-based art | Soft slate walls, cool glow from the screens themselves |
| 4 | The Photography Hall | Photography | Neutral white, even gallery light |
| 5 | Works on Paper | Drawing & mixed medium | Warm plaster, amber light |
| 6 | The Private Collection | Finale / single feature piece | Warm graphite, one strong spot |

**On contrast:** the palette is deliberately low-contrast end to end. Rooms
sit within roughly two stops of each other, the doorway thresholds between
them are warm mid-stone rather than near-black, and the vignette and fog
are kept light — so the walk reads as one continuously-lit building rather
than a series of bright rooms punched out of darkness.

## Folder structure

```
src/
  components/
    Camera/
      CameraRig.jsx        # scroll-driven spline camera + damping, built from ROOMS
      PointerParallax.jsx  # subtle mouse-based rotational parallax
    Gallery/
      Experience.jsx       # <Canvas> wrapper, renderer + postprocessing
      GalleryScene.jsx     # iterates ROOMS, renders each room's themed content
      GalleryHall.jsx       # architecture: per-room walls/floor/ceiling + doorway thresholds
      GallerySpotlight.jsx  # reusable spotlight, tinted per room
      RoomFillLight.jsx     # per-room tinted point light (room "mood" fill)
      LightingRig.jsx        # minimal global neutral base light
      DustParticles.jsx      # atmospheric particles, scoped per room
      VolumetricRay.jsx      # lightweight volumetric light shaft approximation
    Objects/
      ArtworkFrame.jsx      # framed work: moulding + ivory mount + museum plaque
      Sculpture.jsx          # reusable plinth + abstract sculpture
      DigitalArtPanel.jsx    # backlit emissive "screen" for the Digital Room
    UI/
      HeroOverlay.jsx        # masthead, centre title lockup, live room read-out
      ScrollTrack.jsx         # invisible spacer, length driven by ROOMS
      LoadingScreen.jsx       # preloader, gated on real texture progress
  hooks/
    useLenisScroll.js        # Lenis init + scroll progress -> zustand store
    useDeviceTier.js          # perf heuristics for graceful degradation
  lib/
    roomsConfig.js            # ⭐ single source of truth for the whole layout
    artworksConfig.js         # ⭐ the pieces on the walls, grouped by room
    scrollStore.js             # zustand store: single source of scroll truth
  styles/
    global.css
  App.jsx
  main.jsx
public/
  artworks/                   # artwork images (see "Artwork" above)
```

## How the cinematic scroll works

1. `ScrollTrack` renders one pair of invisible spacer `<section>`s per room
   (matching the two camera "stations" authored per room), so total scroll
   length scales automatically with room count.
2. `useLenisScroll` initializes Lenis for inertia-based smooth scrolling and
   writes `scrollY / maxScroll` into a shared zustand store as `progress`
   (0 → 1) every animation frame.
3. `CameraRig` builds a `CatmullRomCurve3` from stations generated per room
   (an "enter" station biased toward one side wall, then a "center"
   station), double-damps scroll progress and the camera pose against it,
   and interpolates FOV between stations for a subtle lens-breathing dolly
   effect. This double damping is what removes all jitter.
4. `GalleryScene` maps over `ROOMS` and renders that room's dedicated
   content component (`PaintingsRoomContent`, `SculptureRoomContent`,
   `DigitalRoomContent`, etc.), each placing `ArtworkFrame` / `Sculpture` /
   `DigitalArtPanel` instances tuned to that room, plus a `RoomFillLight`
   tinted with the room's ambient color and room-scoped `DustParticles`.
5. `GalleryHall` renders one distinctly-toned `RoomShell` (floor/walls/
   ceiling) per room and a narrower, neutral `Threshold` doorway segment
   between each pair of rooms — this is what produces the "hallway leading
   into different rooms" structure.
6. `HeroOverlay` (DOM) reads the same `progress` value to fade the intro
   copy and highlight the active room in the index, built directly from
   `ROOMS` so it never drifts out of sync with the 3D scene.

## Lighting & color per room

- Each room's **spotlights** (`GallerySpotlight`) are tinted with
  `room.lightColor` and use `room.lightIntensity`, so the same reusable
  component produces warm gold in the Painted Wing, cool blue-white in the
  Sculpture Court, and a single dramatic beam in the finale room.
- Since three.js ambient/hemisphere lights are always scene-global, each
  room additionally gets a `RoomFillLight` — a point light tinted with
  `room.ambientColor` and capped to roughly one room's depth via
  `distance` — so no two adjacent rooms bleed color into each other.
- The Digital Room is intentionally lit almost entirely by its own
  `DigitalArtPanel` screens (the artwork doubles as an emissive map, plus a
  small matching point light per panel) rather than spotlights — consistent
  with how real screen-based galleries are lit.
- A single global `<fog>` (warm mid-grey, matching the canvas background)
  keeps the deepest rooms fading gracefully rather than needing per-room fog
  (which three.js doesn't support natively per-mesh).

## Performance & responsiveness

- `useDeviceTier` reduces `dpr`, dust-particle count per room, and disables
  bloom post-processing on lower-tier/touch hardware.
- All per-frame motion happens inside `useFrame` — no React re-renders are
  triggered by scrolling.
- `GalleryScene` is wrapped in `React.memo`; animation is entirely
  imperative via refs.
- Artwork images are pre-downsized to 1100px on the long edge; the whole
  hall is ≈4 MB, and `LoadingScreen` holds the reveal until three.js reports
  them decoded (via drei's `useProgress`) so nothing pops in.
- Procedural textures (floors, wall plaques) are generated once via
  `useMemo` at modest resolution (256–512 px), keeping GPU memory low
  without needing compressed texture files.

## Extending

- **Add a room:** add one object to `ROOM_DEFS` in `roomsConfig.js`, then
  add a matching `XRoomContent` function + entry in `CONTENT_BY_ID` inside
  `GalleryScene.jsx`. Camera path, hallway architecture, and scroll length
  update automatically.
- **Change what's on the walls:** edit `artworksConfig.js` — each room's
  content component destructures that room's array in hanging order.
- **GSAP timelines:** `progress` in `scrollStore` is a perfect driver for
  `gsap.timeline({ paused: true }).progress(progress)` if you want more
  complex choreography (e.g. a spotlight dimming up as the camera enters
  a room) beyond what `useFrame` handles here.

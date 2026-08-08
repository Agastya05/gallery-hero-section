import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScrollStore } from '../../lib/scrollStore';
import { ROOMS, roomIndexForZ } from '../../lib/roomsConfig';
import * as THREE from 'three';

/**
 * CameraRig
 * ---------
 * An entirely original scroll-driven camera controller. Rather than binding
 * the camera directly to scroll (which produces jitter), we maintain a
 * "target" pose derived from scroll progress and critically-damped-lerp the
 * actual camera toward it every frame — this is what produces the smooth,
 * gliding, never-snaps sensation associated with high-end cinematic sites.
 *
 * The camera path is now generated from ROOMS (see lib/roomsConfig.js) so
 * that every themed room automatically gets an "enter" and "center" station,
 * gently alternating left/right to simulate a visitor walking down a hall
 * and turning to face each side as they pass through — without ever
 * hand-authoring a huge, brittle waypoint list.
 */

function buildStations() {
  const stations = [
    // Starting pose, a little back from the first room's entrance.
    { pos: [0, 1.6, ROOMS[0].zStart + 5], look: [0, 1.4, ROOMS[0].zStart], fov: 42 },
  ];

  ROOMS.forEach((room) => {
    const { side } = room; // alternates per room — see roomsConfig
    // Entering the room: camera drifts slightly toward one side wall.
    stations.push({
      pos: [side * 1.6, 1.65, room.zStart - 1.2],
      look: [side * 0.9, 1.5, room.zCenter],
      fov: room.dark ? 36 : 39,
    });
    // Center of the room: camera straightens up to take in the whole space.
    stations.push({
      pos: [side * -0.6, 1.55, room.zCenter],
      look: [side * -0.3, 1.45, room.zEnd],
      fov: room.dark ? 34 : 37,
    });
  });

  return stations;
}

function catmullRomVec3Array(points) {
  return new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    false,
    'catmullrom',
    0.5
  );
}

export default function CameraRig({ children }) {
  const groupRef = useRef();
  const progress = useScrollStore((s) => s.progress);
  const setActiveChapter = useScrollStore((s) => s.setActiveChapter);

  const stations = useMemo(() => buildStations(), []);

  const positionCurve = useMemo(
    () => catmullRomVec3Array(stations.map((s) => s.pos)),
    [stations]
  );
  const lookCurve = useMemo(
    () => catmullRomVec3Array(stations.map((s) => s.look)),
    [stations]
  );

  // Reused vectors to avoid per-frame allocations (perf-critical in R3F).
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 1.4, 0));
  const smoothedProgress = useRef(0);

  useFrame((state, delta) => {
    // Critically damped smoothing of scroll progress itself — this is what
    // decouples camera motion from raw wheel/touch input noise.
    smoothedProgress.current = THREE.MathUtils.damp(
      smoothedProgress.current,
      progress,
      4.5,
      delta
    );
    const t = THREE.MathUtils.clamp(smoothedProgress.current, 0, 1);

    positionCurve.getPointAt(t, targetPos.current);
    lookCurve.getPointAt(t, targetLook.current);

    const cam = state.camera;

    // Damp position (frame-rate independent exponential smoothing).
    cam.position.x = THREE.MathUtils.damp(cam.position.x, targetPos.current.x, 3.2, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, targetPos.current.y, 3.2, delta);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, targetPos.current.z, 3.2, delta);

    // Gentle idle sway — a slow, almost imperceptible breathing motion so
    // the camera never feels perfectly static, even mid-scroll pause.
    const sway = Math.sin(state.clock.elapsedTime * 0.15) * 0.03;
    const bob = Math.cos(state.clock.elapsedTime * 0.12) * 0.02;

    currentLook.current.x = THREE.MathUtils.damp(
      currentLook.current.x,
      targetLook.current.x + sway,
      3,
      delta
    );
    currentLook.current.y = THREE.MathUtils.damp(
      currentLook.current.y,
      targetLook.current.y + bob,
      3,
      delta
    );
    currentLook.current.z = THREE.MathUtils.damp(
      currentLook.current.z,
      targetLook.current.z,
      3,
      delta
    );

    cam.lookAt(currentLook.current);

    // Publish which room the camera is physically in, so the DOM read-out
    // always names the room you can actually see. Written only on change, so
    // this costs one store read per frame and nothing else.
    const room = roomIndexForZ(cam.position.z);
    if (room !== useScrollStore.getState().activeChapter) setActiveChapter(room);

    // Interpolate FOV across stations for a subtle "lens breathing" effect
    // as the camera moves deeper into the gallery (mimics a slow dolly zoom).
    const stationFloat = t * (stations.length - 1);
    const idx = Math.min(Math.floor(stationFloat), stations.length - 2);
    const localT = stationFloat - idx;
    const fovA = stations[idx].fov;
    const fovB = stations[idx + 1].fov;
    const targetFov = THREE.MathUtils.lerp(fovA, fovB, localT);
    cam.fov = THREE.MathUtils.damp(cam.fov, targetFov, 2.5, delta);
    cam.updateProjectionMatrix();
  });

  return <group ref={groupRef}>{children}</group>;
}

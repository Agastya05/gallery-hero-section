/**
 * RoomFillLight
 * -------------
 * A soft, room-scoped point light tinted with that room's ambient color.
 * Since three.js ambient/hemisphere lights are always global, this is our
 * technique for giving each themed room its own distinct color mood
 * (warm gold in the Painted Wing, cool blue-grey in the Sculpture Court,
 * cyan in the Digital Room, etc.) without washing out neighboring rooms —
 * the light's `distance` is capped roughly to one room's depth.
 */
export default function RoomFillLight({ position, color, intensity = 0.6, distance = 9 }) {
  return <pointLight position={position} color={color} intensity={intensity} distance={distance} decay={2} />;
}

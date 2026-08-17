import { forwardRef, Fragment } from 'react';
import { ROOMS } from '../../lib/roomsConfig';

/**
 * ScrollTrack
 * -----------
 * A transparent DOM element purely responsible for creating scrollable
 * height. It renders three <section> spacers per room (roughly matching the
 * side-wall, opposite-wall and far-wall camera beats in CameraRig) plus one
 * extra for the initial approach — so the total scroll length automatically
 * grows as rooms are added to roomsConfig.js, keeping pacing consistent
 * regardless of how many rooms the gallery has.
 */
const ScrollTrack = forwardRef(function ScrollTrack(_, ref) {
  return (
    <div className="scroll-spacer" ref={ref}>
      <section aria-label="Approach" />
      {ROOMS.map((room) => (
        <Fragment key={room.id}>
          <section aria-label={`${room.name} — wall view`} />
          <section aria-label={`${room.name} — pan view`} />
          <section aria-label={`${room.name} — feature view`} />
        </Fragment>
      ))}
    </div>
  );
});

export default ScrollTrack;

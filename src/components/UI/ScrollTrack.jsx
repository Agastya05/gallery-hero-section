import { forwardRef, Fragment } from 'react';
import { ROOMS } from '../../lib/roomsConfig';

/**
 * ScrollTrack
 * -----------
 * A transparent DOM element purely responsible for creating scrollable
 * height. It renders two <section> spacers per room (roughly matching the
 * "enter" and "center" camera stations authored in CameraRig) plus one
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
          <section aria-label={`${room.name} — entrance`} />
          <section aria-label={`${room.name} — center`} />
        </Fragment>
      ))}
    </div>
  );
});

export default ScrollTrack;

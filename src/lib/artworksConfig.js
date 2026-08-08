/**
 * artworksConfig.js
 * -----------------
 * Real works from the Zigguratss catalogue, grouped by the room that hangs
 * them. These replaced the "Image coming soon" placeholder cards.
 *
 * Images live in /public/artworks (downsized to 1100px on the long edge and
 * re-encoded at ~72% quality — roughly 4 MB for the whole hall, which is
 * what keeps first paint quick). Source records:
 *   https://zigguratss.com/artworks/<category>
 *
 * `aspect` is the source image's width ÷ height. Every frame in the scene is
 * authored by *height* and derives its width from this number, so nothing is
 * ever letterboxed or stretched — swapping in a differently-shaped photo
 * just changes how wide its frame sits on the wall.
 */

const A = (id, title, artist, medium, aspect) => ({
  id,
  title,
  artist,
  medium,
  aspect,
  src: `/artworks/${id}.jpg`,
});

export const ARTWORKS = {
  paintings: [
    A('melody-of-dreams', 'Melody of Dreams', 'Uttam Bhattacharya', 'Acrylic on canvas', 1.35),
    A('divine-melody-of-ganesha', 'The Divine Melody of Ganesha', 'Sangita Agarwal', 'Acrylic', 1.35),
    A('the-knights-gambit', "The Knight's Gambit", 'Prasenjit Nath', 'Acrylic', 0.73),
  ],

  // The Sculpture Court shows work in the round; these two are the
  // wall-mounted mixed-media pieces from the same catalogue category.
  sculpture: [
    A('from-that-window', 'From That Window', 'Prasoon Chandra Poddar', 'Mixed media', 0.93),
    A('from-that-window-i', 'From That Window — I', 'Prasoon Chandra Poddar', 'Acrylic', 0.87),
  ],

  digital: [
    A('dreamscape-reflections', 'Dreamscape Reflections', 'Sonaly Gandhi', 'Digital art', 1.0),
    A('spiritual-mirror', 'Spiritual Mirror', 'Ritika', 'Procreate', 0.75),
    A('tranquil-awakening', 'Tranquil Awakening', 'Sonaly Gandhi', 'Digital art', 1.0),
  ],

  photography: [
    A('shepherd', 'Shepherd', 'Sanjay Tomar', 'Photography', 1.5),
    A('milano-darsena', 'Milano e le Storie sulla Darsena', 'Enrica Teclablu Cuccarese', 'Photography', 1.5),
    A('the-sea-and-the-guardian', 'The Sea and The Guardian', 'Enrica Teclablu Cuccarese', 'Photography', 1.5),
  ],

  paper: [
    A('middle-class-10', 'Middle Class 10', 'Shubharanjan Paul', 'Mixed medium on acid-free paper', 0.7),
    A('owl', 'Owl', 'Shubharanjan Paul', 'Mixed medium on acid-free paper', 0.71),
    A('festival-of-colours', 'Festival of Colours', 'Shubharanjan Paul', 'Mixed medium on acid-free paper', 0.71),
  ],

  finale: [A('the-dhyana', 'The Dhyana', 'Prasenjit Nath', 'Acrylic', 0.7)],
};

/** Flat list of every image path, for preloading before the reveal. */
export const ARTWORK_SOURCES = Object.values(ARTWORKS)
  .flat()
  .map((a) => a.src);

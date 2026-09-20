// All four keystroke clips — picked randomly on each keypress.
// We clone the Audio node on every play so multiple rapid keystrokes
// can overlap without the "currentTime = 0 race" killing earlier sounds.
const KEYSTROKE_SRCS = [
  "/sounds/keystroke1.mp3",
  "/sounds/keystroke2.mp3",
  "/sounds/keystroke3.mp3",
  "/sounds/keystroke4.mp3",
];

// Pre-create one Audio object per source so the browser can preload them.
// These are created lazily the first time a user gesture occurs.
let pool = null;

function getPool() {
  if (pool) return pool;
  pool = KEYSTROKE_SRCS.map((src) => {
    const a = new Audio(src);
    a.preload = "auto";
    return a;
  });
  return pool;
}

function useKeyboardSound() {
  const playRandomKeyStrokeSound = () => {
    const sounds = getPool();
    const idx = Math.floor(Math.random() * sounds.length);
    // Clone the node so rapid typing can produce overlapping sounds
    const clone = sounds[idx].cloneNode();
    clone.volume = 0.4;
    clone.play().catch(() => {
      // Silently swallow autoplay policy blocks
    });
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;

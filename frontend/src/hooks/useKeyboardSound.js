const KEYSTROKE_SRCS = [
  "/sounds/keystroke1.mp3",
  "/sounds/keystroke2.mp3",
  "/sounds/keystroke3.mp3",
  "/sounds/keystroke4.mp3",
];

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
    const clone = sounds[idx].cloneNode();
    clone.volume = 0.4;
    clone.play().catch(() => {
    });
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;

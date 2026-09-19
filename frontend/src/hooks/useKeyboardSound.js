// Lazily initialise Audio objects on first use so the browser doesn't
// block them under the autoplay policy (audio created before a user gesture
// cannot always be played).
let soundsReady = false;
let keyStrokeSounds = [];

function ensureSoundsReady() {
  if (soundsReady) return;
  soundsReady = true;
  keyStrokeSounds = [
    new Audio("/sounds/keystroke1.mp3"),
    new Audio("/sounds/keystroke2.mp3"),
    new Audio("/sounds/keystroke3.mp3"),
    new Audio("/sounds/keystroke4.mp3"),
  ];
  // Preload so first keystroke is instant
  keyStrokeSounds.forEach((a) => {
    a.preload = "auto";
    a.load();
  });
}

function useKeyboardSound() {
  const playRandomKeyStrokeSound = () => {
    ensureSoundsReady();
    if (keyStrokeSounds.length === 0) return;
    const randomSound =
      keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
    randomSound.currentTime = 0;
    randomSound.play().catch(() => {
      // Autoplay blocked silently — user hasn't interacted yet
    });
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;

import confetti from 'canvas-confetti';

export const fireWorkoutCompleteConfetti = (): void => {
  void confetti({ particleCount: 110, spread: 72, origin: { y: 0.62 } });
  void confetti({ particleCount: 70, angle: 55, spread: 58, origin: { x: 0, y: 0.62 } });
  void confetti({ particleCount: 70, angle: 125, spread: 58, origin: { x: 1, y: 0.62 } });
};

/** `set-forge-workout-lists-2026-09-25.json` — name of the file the Home page exports all workout lists into. */
export function buildWorkoutListsExportFilename(date = new Date()): string {
  const day = date.toISOString().slice(0, 10);
  return `set-forge-workout-lists-${day}.json`;
}

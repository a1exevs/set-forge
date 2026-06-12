export function downloadJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildWorkoutListsExportFilename(date = new Date()): string {
  const day = date.toISOString().slice(0, 10);
  return `set-forge-workout-lists-${day}.json`;
}

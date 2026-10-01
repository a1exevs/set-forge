import { buildWorkoutListsExportFilename } from '../workout-lists-export-filename';

describe('buildWorkoutListsExportFilename', () => {
  it('names the export after the UTC day', () => {
    expect(buildWorkoutListsExportFilename(new Date('2026-09-25T23:30:00.000Z'))).toBe(
      'set-forge-workout-lists-2026-09-25.json',
    );
  });
});

export const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

import { FC } from 'react';
import { AddExerciseForm } from '@features';
import { Button } from '@shared';
import type { Exercise } from '@entities';
import classes from './home-page.module.scss';

type Props = {
  exercises: Exercise[];
  onRemoveExercise: (id: string) => void;
};

const HomePage: FC<Props> = ({ exercises, onRemoveExercise }) => {
  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>Set Forge</h1>
        <p className={classes.subtitle}>Track your workout progress</p>
      </header>

      <main className={classes.main}>
        <section className={classes.section}>
          <h2>Add Exercise</h2>
          <AddExerciseForm />
        </section>

        <section className={classes.section}>
          <h2>Your Exercises ({exercises.length})</h2>
          {exercises.length === 0 ? (
            <p className={classes.empty}>No exercises yet. Add your first exercise above!</p>
          ) : (
            <div className={classes.exerciseList}>
              {exercises.map((exercise: Exercise) => (
                <div key={exercise.id} className={classes.exerciseCard}>
                  <div className={classes.exerciseHeader}>
                    <h3>{exercise.name}</h3>
                    <span className={classes.badge}>{exercise.muscleGroup}</span>
                  </div>
                  {exercise.description && (
                    <p className={classes.description}>{exercise.description}</p>
                  )}
                  <div className={classes.exerciseFooter}>
                    <span className={classes.date}>
                      Added: {new Date(exercise.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(): void => onRemoveExercise(exercise.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;

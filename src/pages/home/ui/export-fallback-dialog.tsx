import type { WorkoutList } from '@entities';
import { FC, useMemo, useState } from 'react';

import { Button } from '@shared';

import classes from 'src/pages/home/ui/export-fallback-dialog.module.scss';
import {
  buildWorkoutListsExportPayload,
  copyWorkoutListsExport,
  shareWorkoutListsExport,
} from 'src/shared/model/helpers/export-workout-lists-file';
import Dialog from 'src/shared/ui/dialog/dialog';

type Variant = 'options' | 'clipboard' | 'manual';

type Props = {
  open: boolean;
  variant: Variant;
  workoutLists: WorkoutList[];
  json: string;
  filename: string;
  onClose: () => void;
};

const ExportFallbackDialog: FC<Props> = ({ open, variant: initialVariant, workoutLists, json, filename, onClose }) => {
  const [variant, setVariant] = useState<Variant>(initialVariant);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const payload = useMemo(() => buildWorkoutListsExportPayload(workoutLists), [workoutLists]);

  const handleShare = async (): Promise<void> => {
    const result = await shareWorkoutListsExport(payload);

    if (result === 'shared') {
      setStatusMessage('File shared. Save it from the share menu.');
      return;
    }

    if (result === 'cancelled') {
      setStatusMessage('Share cancelled. Try copy or manual export.');
      return;
    }

    setStatusMessage('Share is not available here. Try copy or manual export.');
  };

  const handleCopy = async (): Promise<void> => {
    const copied = await copyWorkoutListsExport(payload);

    if (copied) {
      setCopyState('copied');
      setVariant('clipboard');
      setStatusMessage('');
      return;
    }

    setCopyState('failed');
    setVariant('manual');
    setStatusMessage('Could not copy automatically. Select the text and copy manually.');
  };

  const handleManual = (): void => {
    setVariant('manual');
    setStatusMessage('');
  };

  const title =
    variant === 'options'
      ? 'Export workout lists'
      : variant === 'clipboard'
        ? 'Copied to clipboard'
        : 'Copy export manually';

  const description =
    variant === 'options'
      ? 'Downloads do not work in Telegram. Choose how to save your backup.'
      : variant === 'clipboard'
        ? `Backup JSON is in your clipboard. Paste it into a notes app and save as "${filename}".`
        : `Select all text below, copy it, and save as "${filename}" in your files or notes app.`;

  return (
    <Dialog open={open} onClose={onClose} disableAnimation={true} ariaLabel="Export workout lists backup">
      <div className={classes.container}>
        <h2 className={classes.title}>{title}</h2>
        <p className={classes.description}>{description}</p>

        {variant === 'options' && (
          <div className={classes.optionButtons}>
            <Button variant="primary" onClick={handleShare}>
              Share file
            </Button>
            <Button variant="secondary" onClick={handleCopy}>
              Copy JSON
            </Button>
            <Button variant="secondary" onClick={handleManual}>
              Show JSON
            </Button>
          </div>
        )}

        {variant === 'manual' && (
          <textarea className={classes.textarea} readOnly value={json} aria-label="Workout lists export JSON" />
        )}

        <div className={classes.copyStatus} aria-live="polite">
          {statusMessage}
          {variant === 'manual' && copyState === 'copied' && 'Copied to clipboard'}
          {variant === 'manual' &&
            copyState === 'failed' &&
            'Could not copy automatically. Select the text and copy manually.'}
        </div>

        <div className={classes.buttons}>
          {variant === 'manual' && (
            <Button variant="secondary" onClick={handleCopy}>
              Copy JSON
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ExportFallbackDialog;

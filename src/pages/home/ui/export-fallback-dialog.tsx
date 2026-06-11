import { FC, useState } from 'react';

import { Button } from '@shared';

import classes from 'src/pages/home/ui/export-fallback-dialog.module.scss';
import Dialog from 'src/shared/ui/dialog/dialog';

type Props = {
  open: boolean;
  variant: 'clipboard' | 'manual';
  json: string;
  filename: string;
  onClose: () => void;
};

const ExportFallbackDialog: FC<Props> = ({ open, variant, json, filename, onClose }) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async (): Promise<void> => {
    if (!navigator.clipboard?.writeText) {
      setCopyState('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(json);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  const title = variant === 'clipboard' ? 'Copied to clipboard' : 'Copy export manually';
  const description =
    variant === 'clipboard'
      ? `Backup JSON is in your clipboard. Paste it into a notes app and save as "${filename}".`
      : `Select all text below, copy it, and save as "${filename}" in your files or notes app.`;

  return (
    <Dialog open={open} onClose={onClose} disableAnimation={true} ariaLabel="Export workout lists backup">
      <div className={classes.container}>
        <h2 className={classes.title}>{title}</h2>
        <p className={classes.description}>{description}</p>

        {variant === 'manual' && (
          <>
            <textarea className={classes.textarea} readOnly value={json} aria-label="Workout lists export JSON" />
            <div className={classes.copyStatus} aria-live="polite">
              {copyState === 'copied' && 'Copied to clipboard'}
              {copyState === 'failed' && 'Could not copy automatically. Select the text and copy manually.'}
            </div>
          </>
        )}

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

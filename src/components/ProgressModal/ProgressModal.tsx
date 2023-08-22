import * as React from 'react';
import { CircularProgress } from '@altinn/altinn-design-system';
import { Paragraph, Spinner } from '@digdir/design-system-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, type DialogProps } from '@/components';

import classes from './ProgressModal.module.css';

export interface ProgressModalProps extends Pick<DialogProps, 'open'> {
  /** The text that's displayed besides the spinner */
  loadingText?: string;
  /** The text that's displayed in the middle of the Progress */
  progressLabel?: string;
  /** The value in percent of how much the circualt progress will be filled */
  progressValue: number;
}

export const ProgressModal = ({
  open,
  loadingText,
  progressLabel,
  progressValue,
}: ProgressModalProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open}>
      <DialogContent>
        <div className={classes.content}>
          <div className={classes.circularProgressContainer}>
            <CircularProgress
              width={150}
              value={progressValue}
              label={progressLabel}
              id={'progress' + useId()}
            ></CircularProgress>
          </div>
          {loadingText && (
            <div className={classes.loadingTextContainer}>
              <div className={classes.loadingText}>
                <Paragraph>{loadingText}</Paragraph>
              </div>
              <Spinner title={t('common.loading')} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

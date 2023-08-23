import * as React from 'react';
import { CircularProgress } from '@altinn/altinn-design-system';
import { Paragraph, Spinner } from '@digdir/design-system-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, type DialogProps } from '@/components';
import { useMediaQuery } from '@/resources/hooks';

import classes from './ProgressModal.module.css';

export interface ProgressModalProps extends Pick<DialogProps, 'open'> {
  /** The text that's displayed besides the spinner */
  loadingText?: string;

  /** The text that's displayed in the middle of the circular progress bar */
  progressLabel?: string;

  /** A number value in percentage from 0-100 that sets how much of the circular progress that will be filled */
  progressValue: number;
}

/**
 * A modal component displaying circular progress, loading text, and a spinner.
 * @component
 * @example
 * <ProgressModal
    progressValue={25}
    open={modalOpen}
    progressLabel='1/5'
    loadingText='Prosesserer delegeringer'
  ></ProgressModal>
 * 
 * @property {string} [loadingText] - The text that's displayed besides the spinner.
 * @property {boolean} [open] - State for if the Modal should be open
 * @property {string} [progressLabel] - The text that's displayed in the middle of the Progress
 * @property {number} [progressValue] - The value in percentage of how much of the circular progress will be filled .
 */

export const ProgressModal = ({
  open,
  loadingText,
  progressLabel,
  progressValue,
}: ProgressModalProps) => {
  const { t } = useTranslation();
  const isSm = useMediaQuery('(max-width: 768px)');

  return (
    <Dialog open={open}>
      <DialogContent>
        <div className={classes.content}>
          <div className={classes.circularProgressContainer}>
            <CircularProgress
              width={isSm ? 100 : 130}
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

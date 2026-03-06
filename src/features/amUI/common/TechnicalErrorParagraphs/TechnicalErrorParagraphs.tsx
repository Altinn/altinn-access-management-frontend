import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { DsParagraphProps } from '@altinn/altinn-components';
import { DsParagraph } from '@altinn/altinn-components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import classes from './TechnicalErrorParagraphs.module.css';

export interface TechnicalErrorParagraphsProps {
  /*** The http status of the error */
  status: string;
  /*** The http status of the error */
  time: string;
  /*** The size of the paragraph text */
  size?: DsParagraphProps['data-size'];
  /*** Optional override of message to display */
  message?: string;
  /*** Optional traceId to display */
  traceId?: string;
  /*** Optional extra context to display */
  additionalContext?: string;
}

export const TechnicalErrorParagraphs = ({
  status,
  time,
  size = 'sm',
  message,
  traceId,
  additionalContext,
}: TechnicalErrorParagraphsProps) => {
  const { t } = useTranslation();
  const parsedDate = new Date(time);
  const formattedTime = (isNaN(parsedDate.getTime()) ? new Date() : parsedDate).toLocaleDateString(
    'nb-NO',
    { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  );
  return (
    <>
      <DsParagraph
        data-size={size}
        variant='long'
      >
        {message ?? t('common.technical_error')}
      </DsParagraph>
      <DsParagraph data-size={size}>
        {t('common.time_of_error', { time: formattedTime })}
        {' - '} {t('common.error_status', { status: status })}
      </DsParagraph>
      {traceId && <DsParagraph data-size={size}>{t('common.trace_id', { traceId })}</DsParagraph>}
      {additionalContext && (
        <DsParagraph
          data-size={size}
          className={classes.additionalContext}
        >
          {additionalContext}
        </DsParagraph>
      )}
    </>
  );
};

export const createErrorDetails = (error: FetchBaseQueryError | SerializedError | undefined) =>
  error && 'status' in error
    ? {
        status: error.status.toString(),
        time: error.data as string,
        traceId: (error.data as { traceId?: string })?.traceId,
      }
    : null;

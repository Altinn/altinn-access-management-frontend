import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { DsParagraphProps } from '@altinn/altinn-components';
import { DsParagraph } from '@altinn/altinn-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TechnicalErrorParagraphsProps {
  /*** The http status of the error */
  status: string;
  /*** The http status of the error */
  time: string;
  /*** The size of the paragraph text */
  size?: DsParagraphProps['data-size'];
  /*** Optional override of message to display */
  message?: string;
}

export const TechnicalErrorParagraphs = ({
  status,
  time,
  size = 'sm',
  message,
}: TechnicalErrorParagraphsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DsParagraph
        data-size={size}
        variant='long'
      >
        {message ?? t('common.technical_error')}
      </DsParagraph>
      <DsParagraph data-size={size}>
        {t('common.time_of_error', {
          time: new Date(time).toLocaleDateString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        })}
        - {t('common.error_status', { status: status })}
      </DsParagraph>
    </>
  );
};

export const createErrorDetails = (error: FetchBaseQueryError | SerializedError | undefined) =>
  error && 'status' in error
    ? {
        status: error.status.toString(),
        time: error.data as string,
      }
    : null;

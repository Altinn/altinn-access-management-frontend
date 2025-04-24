import { Alert, Paragraph } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import { TechnicalErrorParagraphs } from '../../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

export interface NewUserAlertProps {
  /*** The technical error if one has occured */
  error?: { status: string; time: string } | null;
  /*** The type of user to be added */
  userType: 'person' | 'org';
}

export const NewUserAlert = ({ error, userType }: NewUserAlertProps) => {
  const { t } = useTranslation();
  let errorText;

  if (error && error.status === '404' && userType === 'person') {
    errorText = <Paragraph data-size='sm'>{t('new_user_modal.not_found_error_person')}</Paragraph>;
  } else if (error && error.status === '400' && userType === 'org') {
    errorText = <Paragraph data-size='sm'>{t('new_user_modal.not_found_error_org')}</Paragraph>;
  } else if (error && error.status === '429') {
    errorText = <Paragraph data-size='sm'>{t('new_user_modal.too_many_requests_error')}</Paragraph>;
  } else if (error) {
    errorText = (
      <TechnicalErrorParagraphs
        status={error.status}
        time={error.time}
        data-size='sm'
      />
    );
  }

  return (
    <Alert
      data-size='sm'
      data-color='danger'
    >
      {errorText}
    </Alert>
  );
};

export const createErrorDetails = (
  isError: boolean,
  error: FetchBaseQueryError | SerializedError | undefined,
) =>
  isError && error && 'status' in error
    ? {
        status: error.status.toString(),
        time: error.data as string,
      }
    : null;

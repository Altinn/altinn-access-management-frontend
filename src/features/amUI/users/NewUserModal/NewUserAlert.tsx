import { Alert, Paragraph } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface NewUserAlertProps {
  /*** The technical error if one has occured */
  error?: { status: string; time: string } | null;
}

export const NewUserAlert = ({ error }: NewUserAlertProps) => {
  const { t } = useTranslation();
  let errorText;

  if (error && error.status === '404') {
    errorText = <Paragraph size='sm'>{t('new_user_modal.not_found_error')}</Paragraph>;
  } else if (error && error.status === '429') {
    errorText = <Paragraph size='sm'>{t('new_user_modal.too_many_requests_error')}</Paragraph>;
  } else if (error) {
    errorText = (
      <>
        <Paragraph
          size='sm'
          variant='long'
        >
          {t('common.technical_error')}
        </Paragraph>
        <Paragraph size='sm'>
          {t('common.time_of_error', {
            time: new Date(error.time).toLocaleDateString('nb-NO', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          })}
        </Paragraph>
        <Paragraph size='sm'>
          {t('common.error_status', {
            status: error.status,
          })}
        </Paragraph>
      </>
    );
  }

  return (
    <Alert
      size='sm'
      color='danger'
    >
      {errorText}
    </Alert>
  );
};

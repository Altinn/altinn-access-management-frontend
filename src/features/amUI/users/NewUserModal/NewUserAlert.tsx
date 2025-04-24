import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

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
    errorText = (
      <DsParagraph data-size='sm'>{t('new_user_modal.not_found_error_person')}</DsParagraph>
    );
  } else if (error && error.status === '400' && userType === 'org') {
    errorText = <DsParagraph data-size='sm'>{t('new_user_modal.not_found_error_org')}</DsParagraph>;
  } else if (error && error.status === '429') {
    errorText = (
      <DsParagraph data-size='sm'>{t('new_user_modal.too_many_requests_error')}</DsParagraph>
    );
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
    <DsAlert
      data-size='sm'
      data-color='danger'
    >
      {errorText}
    </DsAlert>
  );
};

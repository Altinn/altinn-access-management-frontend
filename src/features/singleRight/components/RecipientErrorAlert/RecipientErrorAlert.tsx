import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

type RecipientErrorAlertProps = {
  userUUID: string | null;
  partyUUID: string | null;
};

export const RecipientErrorAlert = ({ userUUID, partyUUID }: RecipientErrorAlertProps) => {
  const { t } = useTranslation();

  if (!userUUID && !partyUUID) {
    return (
      <DsAlert data-color='danger'>
        <DsHeading
          level={3}
          data-size='sm'
        >
          {t('single_rights.missing_recipient_error_title')}
        </DsHeading>
        <DsParagraph>{t('single_rights.missing_recipient_error_message')}</DsParagraph>
      </DsAlert>
    );
  } else {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsHeading
          level={3}
          data-size='sm'
        >
          {t('single_rights.faulty_recipient_error_title')}
        </DsHeading>
        <DsParagraph>{t('single_rights.faulty_recipient_error_message')}</DsParagraph>
      </DsAlert>
    );
  }
};

import { Alert, Heading, Paragraph } from '@digdir/designsystemet-react';
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
      <Alert severity='danger'>
        <Heading
          level={3}
          size='small'
        >
          {t('single_rights.missing_recipient_error_title')}
        </Heading>
        <Paragraph>{t('single_rights.missing_recipient_error_message')}</Paragraph>
      </Alert>
    );
  } else {
    return (
      <Alert
        role='alert'
        severity='danger'
      >
        <Heading
          level={3}
          size='small'
        >
          {t('single_rights.faulty_recipient_error_title')}
        </Heading>
        <Paragraph>{t('single_rights.faulty_recipient_error_message')}</Paragraph>
      </Alert>
    );
  }
};

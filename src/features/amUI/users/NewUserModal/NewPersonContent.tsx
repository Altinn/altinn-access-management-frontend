import { Button, DsAlert, TextField } from '@altinn/altinn-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useValidateNewUserPersonMutation } from '@/rtk/features/userInfoApi';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';

export const NewPersonContent = () => {
  const { t } = useTranslation();
  const [ssn, setSsn] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorTime, setErrorTime] = useState<string>('');

  const [validateNewPerson, { error, isError, isLoading }] = useValidateNewUserPersonMutation();
  const displayLimitedPreviewLaunch = window.featureFlags?.displayLimitedPreviewLaunch;

  const errorDetails =
    isError && error && 'status' in error
      ? {
          status: error.status.toString(),
          time: errorTime,
        }
      : null;

  const navigateIfValidPerson = () => {
    validateNewPerson({ ssn, lastName })
      .unwrap()
      .then((userUuid) => {
        window.location.href = `${window.location.href}/${userUuid}`;
      })
      .catch(() => {
        setErrorTime(new Date().toISOString());
      });
  };

  if (displayLimitedPreviewLaunch) {
    return <DsAlert data-color='info'>{t('new_user_modal.limited_preview_message')}</DsAlert>;
  }

  return (
    <div className={classes.newPersonContent}>
      {isError && (
        <NewUserAlert
          userType='person'
          error={errorDetails}
        />
      )}
      <TextField
        className={classes.textField}
        label={t('common.ssn')}
        size='sm'
        onChange={(e) => setSsn((e.target as HTMLInputElement).value)}
      />
      <TextField
        className={classes.textField}
        label={t('common.last_name')}
        size='sm'
        onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
      />
      <div className={classes.validationButton}>
        <Button
          disabled={ssn.length !== 11 || lastName.length < 1}
          loading={isLoading}
          onClick={navigateIfValidPerson}
        >
          {t('new_user_modal.add_person_button')}
        </Button>
      </div>
    </div>
  );
};

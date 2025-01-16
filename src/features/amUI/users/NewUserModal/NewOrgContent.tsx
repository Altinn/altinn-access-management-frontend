import { Button, TextField } from '@altinn/altinn-components';
import { useState } from 'react';
import { t } from 'i18next';

import { useValidateNewUserOrgMutation } from '@/rtk/features/userInfoApi';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';

export const NewOrgContent = () => {
  const [orgNumber, setOrgNumber] = useState('');
  const [orgName, setOrgName] = useState('');
  const [errorTime, setErrorTime] = useState<string>('');

  const [validateNewOrg, { error, isError, isLoading }] = useValidateNewUserOrgMutation();

  const errorDetails =
    isError && error && 'status' in error
      ? {
          status: error.status.toString(),
          time: errorTime,
        }
      : null;

  const navigateIfValidOrg = () => {
    validateNewOrg({ orgNumber, orgName })
      .unwrap()
      .then((userUuid) => {
        window.location.href = `${window.location.href}/${userUuid}`;
      })
      .catch(() => {
        setErrorTime(new Date().toISOString());
      });
  };

  return (
    <div className={classes.newUserContent}>
      {isError && (
        <NewUserAlert
          userType='org'
          error={errorDetails}
        />
      )}
      <TextField
        className={classes.textField}
        label={t('common.org_number')}
        size='sm'
        onChange={(e) => setOrgNumber((e.target as HTMLInputElement).value)}
      />
      <TextField
        className={classes.textField}
        label={t('common.org_name')}
        size='sm'
        onChange={(e) => setOrgName((e.target as HTMLInputElement).value)}
      />
      <div className={classes.validationButton}>
        <Button
          disabled={orgNumber.length !== 9 || orgName.length < 1}
          loading={isLoading}
          onClick={navigateIfValidOrg}
        >
          {t('new_user_modal.add_button')}
        </Button>
      </div>
    </div>
  );
};

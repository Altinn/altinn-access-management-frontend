import { Button, TextField } from '@altinn/altinn-components';
import { useState } from 'react';
import { t } from 'i18next';
import { Paragraph } from '@digdir/designsystemet-react';

import { useGetOrganizationQuery } from '@/rtk/features/lookupApi';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';

export const NewOrgContent = () => {
  const [orgNumber, setOrgNumber] = useState('');

  const {
    data: orgData,
    isLoading,
    error,
    isError,
  } = useGetOrganizationQuery(orgNumber, { skip: orgNumber.length !== 9 });

  const errorDetails =
    isError && error && 'status' in error
      ? {
          status: error.status.toString(),
          time: error.data as string,
        }
      : null;

  const onAdd = () => {
    if (orgData?.partyUuid) {
      window.location.href = `${window.location.href}/${orgData?.partyUuid}`;
    }
  };

  return (
    <div className={classes.newOrgContent}>
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
        onChange={(e) => setOrgNumber((e.target as HTMLInputElement).value.replace(/ /g, ''))}
      />
      {orgData && (
        <div className={classes.searchResult}>
          <Paragraph>
            <strong>{orgData.name}</strong>
          </Paragraph>
          <Paragraph size='sm'>
            {t('common.org_nr')} {orgData.orgNumber}
            {orgData.unitType === 'AAFY' ||
              (orgData?.unitType === 'BEDR' && ' - ' + t('common.subunit'))}
          </Paragraph>
        </div>
      )}

      <div className={classes.validationButton}>
        <Button
          disabled={orgNumber.length !== 9 || isLoading || !orgData || isError}
          loading={isLoading}
          onClick={onAdd}
        >
          {t('new_user_modal.add_button')}
        </Button>
      </div>
    </div>
  );
};

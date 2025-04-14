import { Button, TextField } from '@altinn/altinn-components';
import { useState } from 'react';
import { t } from 'i18next';
import { Paragraph } from '@digdir/designsystemet-react';

import { useGetOrganizationQuery } from '@/rtk/features/lookupApi';
import { useAddRightHolderMutation } from '@/rtk/features/userInfoApi';

import classes from './NewUserModal.module.css';
import { createErrorDetails, NewUserAlert } from './NewUserAlert';

export const NewOrgContent = () => {
  const [orgNumber, setOrgNumber] = useState('');

  const {
    data: orgData,
    isLoading,
    error: getOrgError,
    isError: isGetOrgError,
  } = useGetOrganizationQuery(orgNumber, { skip: orgNumber.length !== 9 });

  const [addRightHolder, { isError: isAddError, error: addError }] = useAddRightHolderMutation();

  const onAdd = () => {
    if (orgData?.partyUuid) {
      addRightHolder(orgData.partyUuid)
        .unwrap()
        .then(() => {
          window.location.href = `${window.location.href}/${orgData?.partyUuid}`;
        })
        .catch(() => {});
    }
  };

  return (
    <div className={classes.newOrgContent}>
      {isGetOrgError ||
        (isAddError && (
          <NewUserAlert
            userType='org'
            error={
              isGetOrgError
                ? createErrorDetails(isGetOrgError, getOrgError)
                : createErrorDetails(isAddError, addError)
            }
          />
        ))}
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
          <Paragraph data-size='sm'>
            {t('common.org_nr')} {orgData.orgNumber}
            {orgData.unitType === 'AAFY' ||
              (orgData?.unitType === 'BEDR' && ' - ' + t('common.subunit'))}
          </Paragraph>
        </div>
      )}

      <div className={classes.validationButton}>
        <Button
          disabled={orgNumber.length !== 9 || isLoading || !orgData || isGetOrgError}
          loading={isLoading}
          onClick={onAdd}
        >
          {t('new_user_modal.add_button')}
        </Button>
      </div>
    </div>
  );
};

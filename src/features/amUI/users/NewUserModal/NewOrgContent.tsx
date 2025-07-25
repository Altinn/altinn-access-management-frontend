import { Button, TextField, DsParagraph } from '@altinn/altinn-components';
import { useState } from 'react';
import { t } from 'i18next';

import { useGetOrganizationQuery } from '@/rtk/features/lookupApi';
import { useAddRightHolderMutation } from '@/rtk/features/userInfoApi';

import { createErrorDetails } from '../../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';

export const NewOrgContent = () => {
  const [orgNumber, setOrgNumber] = useState('');

  const {
    data: orgData,
    isLoading,
    error: getOrgError,
    isError: isGetOrgError,
  } = useGetOrganizationQuery(orgNumber, { skip: orgNumber.length !== 9 });

  const [addRightHolder, { isError: isAddError, error: addError }] = useAddRightHolderMutation();
  const isError = isGetOrgError || isAddError;

  const onAdd = () => {
    if (orgData?.partyUuid) {
      addRightHolder(orgData.partyUuid)
        .unwrap()
        .then(() => {
          window.location.href = `${window.location.href}/${orgData?.partyUuid}`;
        });
    }
  };

  return (
    <div className={classes.newOrgContent}>
      {isError && (
        <NewUserAlert
          userType='org'
          error={
            isGetOrgError
              ? createErrorDetails(getOrgError)
              : addError && createErrorDetails(addError)
          }
        />
      )}
      <TextField
        className={classes.textField}
        label={t('common.org_number')}
        size='sm'
        onChange={(e) => setOrgNumber((e.target as HTMLInputElement).value.replace(/ /g, ''))}
      />
      {!isGetOrgError && !isLoading && orgData && orgData.orgNumber === orgNumber && (
        <div className={classes.searchResult}>
          <DsParagraph>
            <strong>{orgData.name}</strong>
          </DsParagraph>
          <DsParagraph data-size='sm'>
            {t('common.org_nr')} {orgData.orgNumber}
            {orgData.unitType === 'AAFY' ||
              (orgData?.unitType === 'BEDR' && ' - ' + t('common.subunit'))}
          </DsParagraph>
        </div>
      )}

      <div className={classes.validationButton}>
        <Button
          disabled={isGetOrgError || isLoading || !orgData || orgData.orgNumber !== orgNumber}
          loading={isLoading}
          onClick={onAdd}
        >
          {t('new_user_modal.add_org_button')}
        </Button>
      </div>
    </div>
  );
};

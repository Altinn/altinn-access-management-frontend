import { Button, TextField, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import { useState } from 'react';
import { t } from 'i18next';

import { useGetOrganizationQuery } from '@/rtk/features/lookupApi';
import { User } from '@/rtk/features/userInfoApi';

import { createErrorDetails } from '../../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';
import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';

export const NewOrgContent = ({
  onComplete,
  modalRef,
}: {
  onComplete?: (user: User) => void;
  modalRef: React.RefObject<HTMLDialogElement | null>;
}) => {
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
      addRightHolder({ partyUuidToBeAdded: orgData.partyUuid })
        .unwrap()
        .then(() => {
          if (onComplete) {
            onComplete({
              id: orgData.partyUuid,
              name: orgData.name,
              type: 'organisasjon',
              children: null,
              organizationIdentifier: orgData.orgNumber,
            });
          }
          modalRef.current?.close();
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
          onClick={onAdd}
        >
          <span className={classes.addButton}>
            {isLoading && (
              <DsSpinner
                data-size='xs'
                aria-hidden='true'
              />
            )}
            {isLoading ? <span>{t('common.loading')}</span> : t('new_user_modal.add_org_button')}
          </span>
        </Button>
      </div>
    </div>
  );
};

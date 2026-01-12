import { Button, TextField, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import { useState } from 'react';
import { t } from 'i18next';

import { Organization, useGetOrganizationQuery } from '@/rtk/features/lookupApi';

import { createErrorDetails } from '../../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';

export const NewOrgContent = ({
  addOrg,
  errorDetails,
  isLoading,
}: {
  addOrg?: (orgData: Organization) => void;
  errorDetails?: { status: string; time: string } | null;
  isLoading?: boolean;
}) => {
  const [orgNumber, setOrgNumber] = useState('');

  const {
    data: orgData,
    isLoading: orgDataLoading,
    error: getOrgError,
    isError: isGetOrgError,
  } = useGetOrganizationQuery(orgNumber, { skip: orgNumber.length !== 9 });

  const isError = isGetOrgError || !!errorDetails;

  return (
    <div className={classes.newOrgContent}>
      {isError && (
        <NewUserAlert
          userType='org'
          error={isGetOrgError ? createErrorDetails(getOrgError) : errorDetails && errorDetails}
        />
      )}
      <TextField
        className={classes.textField}
        label={t('common.org_number')}
        size='sm'
        onChange={(e) => setOrgNumber((e.target as HTMLInputElement).value.replace(/ /g, ''))}
      />
      {!isGetOrgError && !orgDataLoading && orgData && orgData.orgNumber === orgNumber && (
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
          onClick={() => addOrg && orgData && addOrg(orgData)}
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

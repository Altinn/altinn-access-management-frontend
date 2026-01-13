import { Button, DsAlert, DsTextfield } from '@altinn/altinn-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';
import { displayPrivDelegation } from '@/resources/utils/featureFlagUtils';

export type personInput = { personIdentifier: string; lastName: string };

export const NewPersonContent = ({
  errorDetails,
  addPerson,
  isLoading,
}: {
  errorDetails?: { status: string; time: string } | null;
  addPerson: (personInput: personInput) => void;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation();
  const [ssn, setSsn] = useState('');
  const [lastName, setLastName] = useState('');
  const [ssnFormatError, setSsnFormatError] = useState<string>('');
  const [lastNameFormatError, setLastNameFormatError] = useState<string>('');
  const shouldDisplayPrivDelegation = displayPrivDelegation();

  const navigateIfValidPerson = () => {
    const personInput = { personIdentifier: ssn, lastName: lastName };
    addPerson(personInput);
  };

  if (!shouldDisplayPrivDelegation) {
    return <DsAlert data-color='info'>{t('new_user_modal.limited_preview_message')}</DsAlert>;
  }

  const isValidSsnFormat = () => ssn.length === 11 && /^\d{11}$/.test(ssn);
  const isValidLastnameFormat = () => lastName.length >= 1;

  return (
    <div className={classes.newPersonContent}>
      {errorDetails && (
        <NewUserAlert
          userType='person'
          error={errorDetails}
        />
      )}
      <DsTextfield
        className={classes.textField}
        label={t('common.ssn')}
        data-size='sm'
        onChange={(e) => setSsn(e.target.value)}
        error={ssnFormatError}
        onBlur={() => {
          const error = isValidSsnFormat() ? '' : t('new_user_modal.ssn_format_error');
          setSsnFormatError(error);
        }}
      />
      <DsTextfield
        className={classes.textField}
        label={t('common.last_name')}
        data-size='sm'
        onChange={(e) => setLastName(e.target.value)}
        error={lastNameFormatError}
        onBlur={() => {
          const error = isValidLastnameFormat() ? '' : t('new_user_modal.last_name_format_error');
          setLastNameFormatError(error);
        }}
      />
      <div className={classes.validationButton}>
        <Button
          disabled={!isValidSsnFormat() || !isValidLastnameFormat()}
          loading={isLoading}
          onClick={navigateIfValidPerson}
        >
          {t('new_user_modal.add_person_button')}
        </Button>
      </div>
    </div>
  );
};

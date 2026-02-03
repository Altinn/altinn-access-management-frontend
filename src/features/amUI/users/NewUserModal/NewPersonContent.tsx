import { Button, DsAlert, DsTextfield } from '@altinn/altinn-components';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';
import { displayPrivDelegation, enableAddUserByUsername } from '@/resources/utils/featureFlagUtils';

export type personInput = { personIdentifier: string; lastName: string };

const isValidSsnFormat = (personIdentifier: string) => /^\d{11}$/.test(personIdentifier);
const isValidUsernameFormat = (personIdentifier: string) =>
  /^[A-Za-z0-9]{6,}$/.test(personIdentifier);
const containsLetter = (personIdentifier: string) => /[A-Za-z]/.test(personIdentifier);

export type NewPersonContentProps = {
  errorDetails?: { status: string; time: string } | null;
  addPerson: (personInput: personInput) => void;
  isLoading?: boolean;
};

export const NewPersonContent = ({ errorDetails, addPerson, isLoading }: NewPersonContentProps) => {
  const { t } = useTranslation();
  const [personIdentifier, setPersonIdentifier] = useState('');
  const [lastName, setLastName] = useState('');
  const [personIdentifierFormatErrorKey, setPersonIdentifierFormatErrorKey] = useState<
    string | null
  >(null);
  const [lastNameFormatError, setLastNameFormatError] = useState<string>('');
  const shouldDisplayPrivDelegation = displayPrivDelegation();
  const allowUsername = enableAddUserByUsername();

  const isValidPersonIdentifierFormat = (identifier: string) => {
    if (allowUsername) {
      return isValidSsnFormat(identifier) || isValidUsernameFormat(identifier);
    }

    return isValidSsnFormat(identifier);
  };

  const getPersonIdentifierErrorKey = (identifier: string) => {
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier.length) {
      return null;
    }

    if (!allowUsername) {
      return !isValidSsnFormat(trimmedIdentifier)
        ? 'new_user_modal.person_identifier_ssn_format_error'
        : null;
    }

    return containsLetter(trimmedIdentifier)
      ? !isValidUsernameFormat(trimmedIdentifier)
        ? 'new_user_modal.person_identifier_username_format_error'
        : null
      : !isValidSsnFormat(trimmedIdentifier)
        ? 'new_user_modal.person_identifier_ssn_format_error'
        : null;
  };

  const navigateIfValidPerson = () => {
    const personInput = { personIdentifier: personIdentifier, lastName: lastName };
    addPerson(personInput);
  };

  if (!shouldDisplayPrivDelegation) {
    return <DsAlert data-color='info'>{t('new_user_modal.limited_preview_message')}</DsAlert>;
  }

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
        label={allowUsername ? t('new_user_modal.person_identifier') : t('common.ssn')}
        data-size='sm'
        onChange={(e) => setPersonIdentifier(e.target.value)}
        error={
          !isValidPersonIdentifierFormat(personIdentifier) && personIdentifierFormatErrorKey ? (
            <Trans
              i18nKey={personIdentifierFormatErrorKey}
              components={{ br: <br /> }}
            />
          ) : null
        }
        onBlur={() => {
          setPersonIdentifierFormatErrorKey(getPersonIdentifierErrorKey(personIdentifier));
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
          disabled={!isValidPersonIdentifierFormat(personIdentifier) || !isValidLastnameFormat()}
          loading={isLoading}
          onClick={navigateIfValidPerson}
        >
          {t('new_user_modal.add_person_button')}
        </Button>
      </div>
    </div>
  );
};

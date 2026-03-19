import { Button, DsAlert, DsTextfield } from '@altinn/altinn-components';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';
import { displayPrivDelegation } from '@/resources/utils/featureFlagUtils';
import { getPersonIdentifierErrorKey } from '../../common/personIdentifierUtils';

export type personInput = { personIdentifier: string; lastName: string };

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

  const navigateIfValidPerson = () => {
    const personInput = {
      personIdentifier: personIdentifier.trim(),
      lastName: lastName.trim(),
    };
    addPerson(personInput);
  };

  if (!shouldDisplayPrivDelegation) {
    return <DsAlert data-color='info'>{t('new_user_modal.limited_preview_message')}</DsAlert>;
  }

  const isValidLastnameFormat = () => lastName.trim().length >= 1;

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
        label={t('new_user_modal.person_identifier')}
        data-size='sm'
        value={personIdentifier}
        onChange={(e) => setPersonIdentifier(e.target.value)}
        error={
          personIdentifierFormatErrorKey ? (
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
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={lastNameFormatError}
        onBlur={() => {
          const error = isValidLastnameFormat() ? '' : t('new_user_modal.last_name_format_error');
          setLastNameFormatError(error);
        }}
      />
      <div className={classes.validationButton}>
        <Button
          disabled={
            personIdentifier.trim().length === 0 ||
            getPersonIdentifierErrorKey(personIdentifier) !== null ||
            !isValidLastnameFormat() ||
            isLoading
          }
          loading={isLoading}
          onClick={navigateIfValidPerson}
        >
          {t('new_user_modal.add_person_button')}
        </Button>
      </div>
    </div>
  );
};

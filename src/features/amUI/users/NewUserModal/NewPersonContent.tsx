import { Button, DsAlert, DsParagraph, DsTextfield } from '@altinn/altinn-components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { User } from '@/rtk/features/userInfoApi';

import classes from './NewUserModal.module.css';
import { NewUserAlert } from './NewUserAlert';
import {
  useAddRightHolderMutation,
  useValidateNewUserPersonMutation,
} from '@/rtk/features/connectionApi';
import { displayPrivDelegation } from '@/resources/utils/featureFlagUtils';

export const NewPersonContent = ({
  onComplete,
  modalRef,
}: {
  onComplete?: (user: User) => void;
  modalRef: React.RefObject<HTMLDialogElement | null>;
}) => {
  const { t } = useTranslation();
  const [ssn, setSsn] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorTime, setErrorTime] = useState<string>('');
  const [ssnFormatError, setSsnFormatError] = useState<string>('');
  const [lastNameFormatError, setLastNameFormatError] = useState<string>('');

  const [addRightHolder, { error, isError, isLoading }] = useAddRightHolderMutation();
  const shouldDisplayPrivDelegation = displayPrivDelegation();

  const errorDetails =
    isError && error && 'status' in error
      ? {
          status: error.status.toString(),
          time: errorTime,
        }
      : null;

  const navigateIfValidPerson = () => {
    const personInput = { personIdentifier: ssn, lastName: lastName };
    addRightHolder({ personInput })
      .unwrap()
      .then((toUuid) => {
        if (onComplete) {
          onComplete({
            id: toUuid,
            name: lastName,
            type: 'person',
            children: null,
          });
        }
        modalRef.current?.close();
      })
      .catch(() => {
        setErrorTime(new Date().toISOString());
      });
  };

  if (!shouldDisplayPrivDelegation) {
    return <DsAlert data-color='info'>{t('new_user_modal.limited_preview_message')}</DsAlert>;
  }

  const isValidSsnFormat = () => ssn.length === 11 && /^\d{11}$/.test(ssn);
  const isValidLastnameFormat = () => lastName.length >= 1;

  return (
    <div className={classes.newPersonContent}>
      {isError && (
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

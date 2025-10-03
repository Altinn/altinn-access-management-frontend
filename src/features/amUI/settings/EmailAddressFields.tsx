import { validateEmail } from '@/resources/utils/textFieldUtils';
import { DsButton, DsTextfield } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';

import classes from './SettingsModal.module.css';
import { NotificationAddress } from '@/rtk/features/settingsApi';

export const EmailAddressFields = ({
  addressList,
  setAddressList,
  isLoading,
}: {
  addressList: NotificationAddress[];
  setAddressList: React.Dispatch<React.SetStateAction<NotificationAddress[]>>;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const onTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = { ...newList[index], email: e.target.value };
    setAddressList(newList);
  };
  const [validationErrors, setValidationErrors] = React.useState<string[]>(
    Array.from({ length: addressList.length }, () => ''),
  );

  useEffect(() => {
    if (addressList.length < validationErrors.length) {
      setValidationErrors((prevErrors) => [...prevErrors, '']);
    } else if (addressList.length > validationErrors.length) {
      setValidationErrors((prevErrors) => prevErrors.slice(0, addressList.length));
    }
  }, [addressList]);

  const emailFields = addressList.map((address, index) => {
    return (
      <div
        key={index}
        className={classes.emailFieldRow}
      >
        <DsTextfield
          aria-label={t('settings_page.address_number', { number: index + 1 })}
          value={address.email}
          onChange={(e) => onTextFieldChange(e, index)}
          onBlur={() => {
            const validation = validateEmail(address.email);
            const newErrors = [...validationErrors];
            newErrors[index] =
              validation.isValid || address.email.length === 0 ? '' : validation.errorMessageKey;
            setValidationErrors(newErrors);
          }}
          disabled={isLoading}
          error={validationErrors[index] ? t(validationErrors[index]) : undefined}
        />
        {addressList.length > 1 && (
          <DsButton
            icon
            variant='tertiary'
            onClick={() => {
              const newList = [...addressList];
              newList.splice(index, 1);
              setAddressList(newList);
            }}
            className={classes.removeButton}
            data-size='md'
          >
            <MinusCircleIcon aria-label={t('settings_page.remove_email')} />
          </DsButton>
        )}
      </div>
    );
  });

  return <>{emailFields}</>;
};

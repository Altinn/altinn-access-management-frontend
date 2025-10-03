import { validatePhoneNumber } from '@/resources/utils/textFieldUtils';
import { DsButton, DsTextfield } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';

import classes from './SettingsModal.module.css';
import { NotificationAddress } from '@/rtk/features/settingsApi';

export const SmsAddressFields = ({
  addressList,
  setAddressList,
  isLoading,
}: {
  addressList: NotificationAddress[];
  setAddressList: React.Dispatch<React.SetStateAction<NotificationAddress[]>>;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
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

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = { ...newList[index], phone: e.target.value.replaceAll(/\s+/g, '') };
    setAddressList(newList);
  };
  const onCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = { ...newList[index], countryCode: e.target.value };
    setAddressList(newList);
  };

  const isValidCountryCodeChange = (input: string) => {
    return /^(\+\d{1,3}|\+)$/.test(input);
  };

  const phoneFields = addressList.map((address, index) => {
    const phoneValidation = validatePhoneNumber(address.phone);
    return (
      <div
        key={index}
        className={classes.phoneFieldRow}
      >
        <DsTextfield
          aria-label={t('settings_page.country_code_number', { number: index + 1 })}
          value={address.countryCode}
          onChange={(e) =>
            isValidCountryCodeChange(e.target.value) ? onCountryCodeChange(e, index) : null
          }
          disabled={isLoading}
          className={classes.countryCodeField}
        />
        <DsTextfield
          aria-label={t('settings_page.phone_number', { number: index + 1 })}
          value={address.phone}
          onChange={(e) => onPhoneChange(e, index)}
          onBlur={() => {
            const validation = validatePhoneNumber(address.phone);
            const newErrors = [...validationErrors];
            newErrors[index] =
              validation.isValid || address.phone.length === 0 ? '' : validation.errorMessageKey;
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
            <MinusCircleIcon aria-label={t('settings_page.remove_sms')} />
          </DsButton>
        )}
      </div>
    );
  });

  return <>{phoneFields}</>;
};

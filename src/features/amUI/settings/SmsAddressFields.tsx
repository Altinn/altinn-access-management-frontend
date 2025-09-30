import { validatePhoneNumber } from '@/resources/utils/textFieldUtils';
import { DsButton, DsTextfield } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import classes from './SettingsModal.module.css';
import { Address } from '@/rtk/features/settingsApi';

export const SmsAddressFields = ({
  addressList,
  setAddressList,
  isLoading,
}: {
  addressList: Address[];
  setAddressList: React.Dispatch<React.SetStateAction<Address[]>>;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = { ...newList[index], phone: e.target.value };
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
          disabled={isLoading}
          error={
            phoneValidation.isValid || address.phone.length === 0
              ? ''
              : t(phoneValidation.errorMessageKey)
          }
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

  return <>{phoneFields}</>;
};

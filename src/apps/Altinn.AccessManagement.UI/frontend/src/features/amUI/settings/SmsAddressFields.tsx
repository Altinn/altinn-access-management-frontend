import { DsButton, DsTextfield } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { type AddressRow, COUNTRY_CODE_ERROR_KEY } from './addressMgmtUtils';
import classes from './SettingsModal.module.css';

export const SmsAddressFields = ({
  addressList,
  setAddressList,
  onValidateRow,
  isLoading,
}: {
  addressList: AddressRow[];
  setAddressList: React.Dispatch<React.SetStateAction<AddressRow[]>>;
  onValidateRow: (index: number) => void;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = {
      ...newList[index],
      phone: e.target.value.replaceAll(/\s+/g, ''),
      errorKey: undefined,
    };
    setAddressList(newList);
  };
  const onCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = { ...newList[index], countryCode: e.target.value, errorKey: undefined };
    setAddressList(newList);
  };

  const isValidCountryCodeChange = (input: string) => {
    return /^(\+\d{1,3}|\+)$/.test(input);
  };

  const phoneFields = addressList.map((address, index) => {
    return (
      <div
        key={index}
        className={classes.phoneFieldRow}
        data-testid='sms-address-row'
      >
        <DsTextfield
          data-testid='sms-country-code'
          aria-label={t('settings_page.country_code_number', { number: index + 1 })}
          aria-invalid={address.errorKey === COUNTRY_CODE_ERROR_KEY || undefined}
          value={address.countryCode}
          onChange={(e) =>
            isValidCountryCodeChange(e.target.value) ? onCountryCodeChange(e, index) : null
          }
          onBlur={() => onValidateRow(index)}
          disabled={isLoading}
          className={classes.countryCodeField}
        />
        <DsTextfield
          data-testid='sms-phone'
          aria-label={t('settings_page.phone_number', { number: index + 1 })}
          value={address.phone}
          onChange={(e) => onPhoneChange(e, index)}
          onBlur={() => onValidateRow(index)}
          disabled={isLoading}
          error={address.errorKey ? t(address.errorKey) : undefined}
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
            disabled={isLoading}
          >
            <MinusCircleIcon aria-label={t('settings_page.remove_sms')} />
          </DsButton>
        )}
      </div>
    );
  });

  return <>{phoneFields}</>;
};

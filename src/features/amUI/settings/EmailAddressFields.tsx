import { validateEmail } from '@/resources/utils/textFieldUtils';
import { DsButton, DsTextfield } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import classes from './SettingsModal.module.css';
import { Address } from '@/rtk/features/settingsApi';

export const EmailAddressFields = ({
  addressList,
  setAddressList,
  isLoading,
}: {
  addressList: Address[];
  setAddressList: React.Dispatch<React.SetStateAction<Address[]>>;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const onTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = { ...newList[index], email: e.target.value };
    setAddressList(newList);
  };

  const emailFields = addressList.map((address, index) => {
    const validation = validateEmail(address.email);
    return (
      <div
        key={index}
        className={classes.emailFieldRow}
      >
        <DsTextfield
          aria-label={t('settings_page.address_number', { number: index + 1 })}
          value={address.email}
          onChange={(e) => onTextFieldChange(e, index)}
          disabled={isLoading}
          error={
            validation.isValid || address.email.length === 0 ? '' : t(validation.errorMessageKey)
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

  return <>{emailFields}</>;
};

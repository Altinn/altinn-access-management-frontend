import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useGetOrgNotificationAddressesQuery } from '@/rtk/features/settingsApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ChatIcon, PaperplaneIcon } from '@navikt/aksel-icons';
import { PlusIcon } from '@navikt/aksel-icons';

import classes from './SettingsModal.module.css';
import { EmailAddressFields } from './EmailAddressFields';
import { SmsAddressFields } from './SmsAddressFields';
import {
  validateEmail,
  validatePhoneNumber,
  validateCountryCode,
} from '@/resources/utils/textFieldUtils';

export type Address = {
  email: string;
  phone: string;
  countryCode: string;
};

export const SettingsModal = ({
  mode,
  open,
  onClose,
}: {
  mode: 'email' | 'sms' | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [addressList, setAddressList] = useState<Address[]>([
    { email: '', phone: '', countryCode: '' },
  ]);
  const [storedAddresses, setStoredAddresses] = useState<Address[]>([
    { email: '', phone: '', countryCode: '' },
  ]);
  const { data: notificationAddresses, isLoading } = useGetOrgNotificationAddressesQuery(
    actingParty?.orgNumber ?? '',
    { skip: !actingParty?.orgNumber },
  );

  const addressIsEqual = (a: Address, b: Address) =>
    a.email === b.email && a.phone === b.phone && a.countryCode === b.countryCode;

  const isChanges =
    (storedAddresses.length === 0 && !!addressList[0]) ||
    addressList.length !== storedAddresses.length ||
    addressList.some((addr, index) => !addressIsEqual(storedAddresses[index], addr));

  useEffect(() => {
    if (isLoading) return;
    if (mode === 'email') {
      const emailAddresses = notificationAddresses
        ?.filter((addr) => addr.email)
        .map((addr) => ({ email: addr.email, phone: '', countryCode: '' }));
      const setList =
        emailAddresses && emailAddresses.length > 0
          ? emailAddresses
          : [{ email: '', phone: '', countryCode: '' }];
      setAddressList(setList);
      setStoredAddresses(setList);
    } else if (mode === 'sms') {
      const phoneNumbers = notificationAddresses
        ?.filter((addr) => addr.phone)
        .map((addr) => ({ email: '', phone: addr.phone, countryCode: addr.countryCode }));
      const setList =
        phoneNumbers && phoneNumbers.length > 0
          ? phoneNumbers
          : [{ email: '', phone: '', countryCode: '' }];
      setAddressList(setList);
      setStoredAddresses(setList);
    }
  }, [mode, notificationAddresses, isLoading]);

  let headingText = '';
  let labelText = '';
  let icon = null;
  switch (mode) {
    case 'email':
      headingText = t('settings_page.alerts_on_email');
      labelText = t('settings_page.email_label');
      icon = <PaperplaneIcon fontSize='2rem' />;
      break;
    case 'sms':
      headingText = t('settings_page.alerts_on_sms');
      labelText = t('settings_page.sms_label');
      icon = <ChatIcon fontSize='2rem' />;
      break;
    default:
      return null;
  }

  const isValidAddresses = (addresses: Address[]) => {
    return addresses
      .filter((address) => address.email.length > 0 || address.phone.length > 0)
      .every((address) => {
        return (
          (address.email.length > 0 && validateEmail(address.email).isValid) ||
          (address.phone.length > 0 &&
            validatePhoneNumber(address.phone).isValid &&
            validateCountryCode(address.countryCode).isValid)
        );
      });
  };

  return (
    <DsDialog
      open={open}
      onClose={onClose}
      closedby='any'
    >
      <div className={classes.modalHeader}>
        {icon}
        <DsHeading
          level={2}
          data-size='xs'
        >
          {headingText}
        </DsHeading>
      </div>

      <div className={classes.modalContent}>
        <DsHeading
          level={3}
          data-size='2xs'
        >
          {labelText}
        </DsHeading>
        <div className={classes.addressList}>
          {mode === 'email' && (
            <EmailAddressFields
              addressList={addressList}
              setAddressList={setAddressList}
              isLoading={isLoading}
            />
          )}
          {mode === 'sms' && (
            <SmsAddressFields
              addressList={addressList}
              setAddressList={setAddressList}
              isLoading={isLoading}
            />
          )}
        </div>
        <DsButton
          variant='secondary'
          onClick={() => {
            setAddressList([
              ...addressList,
              { email: '', phone: '', countryCode: mode === 'sms' ? '+47' : '' },
            ]);
          }}
          disabled={isLoading || addressList.length >= 10}
        >
          <PlusIcon />
          {t('settings_page.add_more')}
        </DsButton>
        <DsParagraph className={classes.infoText}>
          {t('settings_page.manage_addresses_info')}
        </DsParagraph>
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            onClick={() => {
              setAddressList(storedAddresses);
            }}
            disabled={isLoading || !isChanges || !isValidAddresses(addressList)}
          >
            {t('common.save_changes')}
          </DsButton>
          <DsButton
            variant='secondary'
            onClick={() => {
              onClose();
            }}
          >
            {t('common.cancel')}
          </DsButton>
        </div>
      </div>
    </DsDialog>
  );
};

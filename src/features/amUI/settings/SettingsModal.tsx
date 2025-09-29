import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsDialog, DsHeading, DsParagraph, DsTextfield } from '@altinn/altinn-components';
import { useGetOrgNotificationAddressesQuery } from '@/rtk/features/settingsApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ChatIcon, MinusCircleIcon, PaperplaneIcon } from '@navikt/aksel-icons';
import { PlusIcon } from '@navikt/aksel-icons';

import classes from './SettingsModal.module.css';
import { validateEmail, validatePhoneNumber } from '@/resources/utils/textFieldUtils';

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
  const [addressList, setAddressList] = useState<string[]>(['']);
  const [storedAddresses, setStoredAddresses] = useState<string[]>(['']);

  const isChanges =
    (storedAddresses.length === 0 && !!addressList[0]) ||
    addressList.length !== storedAddresses.length ||
    addressList.some((addr, index) => storedAddresses[index] !== addr);

  const { data: notificationAddresses, isLoading } = useGetOrgNotificationAddressesQuery(
    actingParty?.orgNumber ?? '',
    { skip: !actingParty?.orgNumber },
  );

  console.log('addressList', addressList);
  console.log('storedAddresses', storedAddresses);
  console.log('isChanges', isChanges);

  useEffect(() => {
    if (isLoading) return;
    if (mode === 'email') {
      const emailAddresses = notificationAddresses
        ?.filter((addr) => addr.email)
        .map((addr) => addr.email) ?? [''];
      const setList = emailAddresses.length > 0 ? emailAddresses : [''];
      setAddressList(setList);
      setStoredAddresses(setList);
    } else if (mode === 'sms') {
      const phoneNumbers = notificationAddresses
        ?.filter((addr) => addr.phone)
        .map((addr) => addr.phone) ?? [''];
      const setList = phoneNumbers.length > 0 ? phoneNumbers : [''];
      setAddressList(setList);
      setStoredAddresses(setList);
    }
  }, [mode, notificationAddresses, isLoading]);

  let headingText = '';
  let labelText = '';
  let icon = null;
  let removeLabel = '';
  switch (mode) {
    case 'email':
      headingText = t('settings_page.alerts_on_email');
      labelText = t('settings_page.email_label');
      removeLabel = t('settings_page.remove_email');
      icon = <PaperplaneIcon fontSize='2rem' />;
      break;
    case 'sms':
      headingText = t('settings_page.alerts_on_sms');
      labelText = t('settings_page.sms_label');
      removeLabel = t('settings_page.remove_sms');
      icon = <ChatIcon fontSize='2rem' />;
      break;
    default:
      return null;
  }

  const onTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newList = [...addressList];
    newList[index] = e.target.value;
    setAddressList(newList);
  };

  const addressFields = addressList.map((address, index) => {
    const validation = mode === 'email' ? validateEmail(address) : validatePhoneNumber(address);
    return (
      <div
        key={index}
        className={classes.addressFieldRow}
      >
        <DsTextfield
          aria-label={t('settings_page.address_number', { number: 1 })}
          value={address}
          onChange={(e) => onTextFieldChange(e, index)}
          disabled={isLoading}
          error={validation.isValid || address.length === 0 ? '' : t(validation.errorMessageKey)}
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
            data-color={'danger'}
            data-size='md'
          >
            <MinusCircleIcon aria-label={removeLabel} />
          </DsButton>
        )}
      </div>
    );
  });

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
        <div className={classes.addressList}>{addressFields}</div>
        <DsButton
          variant='secondary'
          onClick={() => {
            setAddressList([...addressList, '']);
          }}
          disabled={isLoading || addressList.length >= 5}
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
            disabled={isLoading || !isChanges}
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

import React, { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSpinner,
} from '@altinn/altinn-components';
import { ChatIcon, PaperplaneIcon, PlusIcon } from '@navikt/aksel-icons';

import {
  type NotificationAddress,
  useGetOrgNotificationAddressesQuery,
} from '@/rtk/features/settingsApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './SettingsModal.module.css';
import { EmailAddressFields } from './EmailAddressFields';
import { SmsAddressFields } from './SmsAddressFields';
import {
  type AddressRow,
  addressIsEmpty,
  getAddressErrorKey,
  isValidAddresses,
  useSaveAddressChanges,
} from './addressMgmtUtils';

const createEmptyRow = (mode: 'email' | 'sms'): AddressRow => ({
  notificationAddressId: '',
  email: '',
  phone: '',
  countryCode: mode === 'sms' ? '+47' : '',
});

export const SettingsModal = ({
  mode,
  open,
  canDeleteLastAddress,
  onClose,
}: {
  mode: 'email' | 'sms' | null;
  open: boolean;
  canDeleteLastAddress: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [addressList, setAddressList] = useState<AddressRow[]>([]);
  const [storedAddresses, setStoredAddresses] = useState<NotificationAddress[]>([]);
  const { data: notificationAddresses, isLoading } = useGetOrgNotificationAddressesQuery(
    actingParty?.organizationIdentifier ?? '',
    { skip: !actingParty?.organizationIdentifier },
  );
  const { isChanges, saveChanges, isSaving, generalErrorKey, setGeneralErrorKey } =
    useSaveAddressChanges(storedAddresses, addressList, setAddressList);

  const onAddressesLoaded = useEffectEvent(
    (addresses: NotificationAddress[], addressMode: 'email' | 'sms') => {
      setStoredAddresses(addresses);
      // Keep what the user has typed while there are errors to correct
      if (generalErrorKey || addressList.some((row) => row.errorKey)) return;
      setAddressList(addresses.length > 0 ? addresses : [createEmptyRow(addressMode)]);
    },
  );

  useEffect(() => {
    if (isLoading || !mode) return;
    onAddressesLoaded(
      notificationAddresses?.filter((addr) => (mode === 'email' ? addr.email : addr.phone)) ?? [],
      mode,
    );
  }, [mode, notificationAddresses, isLoading]);

  let headingText = '';
  let labelText = '';
  let icon = null;
  const noAddressesError =
    addressList.length > 0 && addressList.every(addressIsEmpty) && !canDeleteLastAddress;
  switch (mode) {
    case 'email':
      headingText = t('settings_page.alerts_on_email');
      labelText = t('settings_page.email_label');
      icon = (
        <PaperplaneIcon
          fontSize='2rem'
          aria-hidden='true'
        />
      );
      break;
    case 'sms':
      headingText = t('settings_page.alerts_on_sms');
      labelText = t('settings_page.sms_label');
      icon = (
        <ChatIcon
          fontSize='2rem'
          aria-hidden='true'
        />
      );
      break;
    default:
      return null;
  }

  const closeModal = () => {
    setGeneralErrorKey(undefined);
    setAddressList([]);
    onClose();
  };

  const validateRow = (index: number) => {
    setAddressList((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, errorKey: getAddressErrorKey(row, storedAddresses) } : row,
      ),
    );
  };

  return (
    <DsDialog
      open={open}
      onClose={closeModal}
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
              onValidateRow={validateRow}
              isLoading={isLoading || isSaving}
            />
          )}
          {mode === 'sms' && (
            <SmsAddressFields
              addressList={addressList}
              setAddressList={setAddressList}
              onValidateRow={validateRow}
              isLoading={isLoading || isSaving}
            />
          )}
        </div>
        <DsButton
          variant='secondary'
          onClick={() => {
            setAddressList([...addressList, createEmptyRow(mode)]);
          }}
          disabled={isLoading || isSaving || addressList.length >= 10}
        >
          <PlusIcon aria-hidden='true' />
          {t('settings_page.add_more')}
        </DsButton>
        <DsParagraph className={classes.infoText}>
          {t('settings_page.manage_addresses_info')}
        </DsParagraph>
        {(noAddressesError || generalErrorKey) && (
          <DsAlert
            role='alert'
            data-color='danger'
            className={classes.errorBox}
            data-size='sm'
          >
            <DsParagraph className={classes.errorText}>
              {t(generalErrorKey ?? 'settings_page.no_addresses_error')}
            </DsParagraph>
          </DsAlert>
        )}
        <div className={classes.buttonRow}>
          <DsButton
            variant='primary'
            onClick={() => void saveChanges()}
            disabled={
              isLoading ||
              !isChanges ||
              !isValidAddresses(addressList, storedAddresses) ||
              isSaving ||
              noAddressesError
            }
          >
            {isSaving && (
              <DsSpinner
                data-size='sm'
                aria-label={t('common.loading')}
              />
            )}
            {t('common.save_changes')}
          </DsButton>
          <DsButton
            variant='secondary'
            onClick={closeModal}
          >
            {isChanges ? t('common.cancel') : t('common.close')}
          </DsButton>
        </div>
      </div>
    </DsDialog>
  );
};

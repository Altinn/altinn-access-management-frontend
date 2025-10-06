import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  DsSpinner,
} from '@altinn/altinn-components';
import {
  Address,
  NotificationAddress,
  useGetOrgNotificationAddressesQuery,
} from '@/rtk/features/settingsApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ChatIcon, PaperplaneIcon } from '@navikt/aksel-icons';
import { PlusIcon } from '@navikt/aksel-icons';

import classes from './SettingsModal.module.css';
import { EmailAddressFields } from './EmailAddressFields';
import { SmsAddressFields } from './SmsAddressFields';
import { addressIsEmpty, isValidAddresses, useSaveAddressChanges } from './addressMgmtUtils';

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
  const [addressList, setAddressList] = useState<NotificationAddress[]>([]);
  const [storedAddresses, setStoredAddresses] = useState<NotificationAddress[]>([]);
  const { data: notificationAddresses, isLoading } = useGetOrgNotificationAddressesQuery(
    actingParty?.orgNumber ?? '',
    { skip: !actingParty?.orgNumber },
  );
  const { isChanges, saveChanges, isSaving, isError, setIsError } = useSaveAddressChanges(
    storedAddresses,
    addressList,
  );

  useEffect(() => {
    if (isLoading) return;
    if (mode === 'email') {
      const emailAddresses = notificationAddresses?.filter((addr) => addr.email);
      const setList =
        emailAddresses && emailAddresses.length > 0
          ? emailAddresses
          : [{ email: '', phone: '', countryCode: '', notificationAddressId: '' }];
      setAddressList(setList);
      setStoredAddresses(emailAddresses ?? []);
    } else if (mode === 'sms') {
      const smsAddresses = notificationAddresses?.filter((addr) => addr.phone);
      const setList =
        smsAddresses && smsAddresses.length > 0
          ? smsAddresses
          : [{ email: '', phone: '', countryCode: '+47', notificationAddressId: '' }];
      setAddressList(setList);
      setStoredAddresses(smsAddresses ?? []);
    }
  }, [mode, notificationAddresses, isLoading]);

  let headingText = '';
  let labelText = '';
  let icon = null;
  const noAddressesError =
    addressList.length === 1 && addressIsEmpty(addressList[0]) && !canDeleteLastAddress;
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

  const closeModal = () => {
    setIsError(false);
    onClose();
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
        {(noAddressesError || isError) && (
          <DsAlert
            data-color='danger'
            className={classes.errorBox}
            data-size='sm'
          >
            <DsParagraph className={classes.errorText}>
              {isError
                ? t('settings_page.error_saving_addresses')
                : t('settings_page.no_addresses_error')}
            </DsParagraph>
          </DsAlert>
        )}
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
              {
                notificationAddressId: '',
                email: '',
                phone: '',
                countryCode: mode === 'sms' ? '+47' : '',
              },
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
            onClick={saveChanges}
            disabled={
              isLoading ||
              !isChanges ||
              !isValidAddresses(addressList) ||
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
            {t('common.cancel')}
          </DsButton>
        </div>
      </div>
    </DsDialog>
  );
};

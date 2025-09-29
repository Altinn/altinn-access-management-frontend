import React from 'react';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { Divider, DsButton, DsHeading, List, SettingsItem } from '@altinn/altinn-components';
import { useGetOrgNotificationAddressesQuery } from '@/rtk/features/settingsApi';

import classes from './SettingsPageContent.module.css';
import { ChatIcon, PaperplaneIcon } from '@navikt/aksel-icons';
import { SettingsModal } from './SettingsModal';

export const SettingsPageContent = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('settings_page.page_title'));

  const [openModal, setOpenModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'email' | 'sms' | null>(null);

  const { actingParty, isLoading: actorLoading } = usePartyRepresentation();
  const { data: notificationAddresses, isLoading: notifLoading } =
    useGetOrgNotificationAddressesQuery(actingParty?.orgNumber ?? '', {
      skip: !actingParty?.orgNumber,
    });

  const emailAddresses =
    notificationAddresses?.filter((addr) => addr.email).map((addr) => addr.email) ?? [];
  const phoneNumbers =
    notificationAddresses
      ?.filter((addr) => addr.phone)
      .map((addr) => `${addr.countryCode} ${addr.phone}`) ?? [];
  const isLoading = actorLoading || notifLoading;

  const onSettingsClick = (mode: 'email' | 'sms') => {
    setModalMode(mode);
    setOpenModal(true);
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
  };

  return (
    <div className={classes.pageContent}>
      <DsHeading
        level={1}
        data-size='sm'
      >
        {t('settings_page.page_heading', { name: actingParty?.name })}
      </DsHeading>
      <DsHeading
        level={2}
        data-size='xs'
      >
        {t('settings_page.alert_settings_heading')}
      </DsHeading>
      <div className={classes.settingsListContainer}>
        <List size='sm'>
          <SettingsItem
            title={t('settings_page.alerts_on_email')}
            value={emailAddresses.join(', ')}
            icon={<PaperplaneIcon />}
            badge={
              emailAddresses.length > 0 && {
                label:
                  emailAddresses.length === 1
                    ? t('settings_page.one_address')
                    : t('settings_page.num_of_addresses', { count: emailAddresses.length }),
              }
            }
            as={'button'}
            onClick={() => onSettingsClick('email')}
            controls={emailAddresses.length === 0 && t('common.add')}
            loading={isLoading}
            linkIcon
          />
          <Divider as='li' />
          <SettingsItem
            title={t('settings_page.alerts_on_sms')}
            value={phoneNumbers.join(', ')}
            icon={<ChatIcon />}
            badge={
              phoneNumbers.length > 0 && {
                label:
                  phoneNumbers.length === 1
                    ? t('settings_page.one_address')
                    : t('settings_page.num_of_addresses', { count: phoneNumbers.length }),
              }
            }
            as={'button'}
            onClick={() => onSettingsClick('sms')}
            loading={isLoading}
            controls={phoneNumbers.length === 0 && t('common.add')}
            linkIcon
          />
        </List>
        <SettingsModal
          mode={modalMode}
          open={openModal}
          onClose={onCloseModal}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation, Trans } from 'react-i18next';
import {
  Divider,
  DsAlert,
  DsButton,
  DsHeading,
  DsPopover,
  List,
  SettingsItem,
} from '@altinn/altinn-components';
import { useGetOrgNotificationAddressesQuery } from '@/rtk/features/settingsApi';

import classes from './SettingsPageContent.module.css';
import { ChatIcon, PaperplaneIcon, QuestionmarkCircleIcon } from '@navikt/aksel-icons';
import { SettingsModal } from './SettingsModal';
import { useGetIsCompanyProfileAdminQuery } from '@/rtk/features/userInfoApi';

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

  const { data: isCompanyProfileAdmin, isLoading: isCompanyProfileAdminLoading } =
    useGetIsCompanyProfileAdminQuery();

  const emailAddresses =
    notificationAddresses?.filter((addr) => addr.email).map((addr) => addr.email) ?? [];
  const phoneNumbers =
    notificationAddresses
      ?.filter((addr) => addr.phone)
      .map((addr) => `${addr.countryCode} ${addr.phone}`) ?? [];
  const isLoading = actorLoading || notifLoading || isCompanyProfileAdminLoading;

  const onSettingsClick = (mode: 'email' | 'sms') => {
    setModalMode(mode);
    setOpenModal(true);
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode(null);
  };

  // Show not-admin alert when loaded and user lacks permission
  if (!isCompanyProfileAdmin && !isCompanyProfileAdminLoading) {
    return (
      <div className={classes.pageContent}>
        <DsAlert data-color='warning'>
          {t('settings_page.not_admin_alert', { name: actingParty?.name || '' })}
        </DsAlert>
      </div>
    );
  }

  return (
    <div className={classes.pageContent}>
      <DsHeading
        level={1}
        data-size='sm'
      >
        {t('settings_page.page_heading', { name: actingParty?.name })}
      </DsHeading>
      <div className={classes.settingsHeaderAndInfo}>
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('settings_page.alert_settings_heading')}
        </DsHeading>
        <DsPopover.TriggerContext>
          <DsPopover.Trigger
            variant='tertiary'
            icon
          >
            <QuestionmarkCircleIcon />
          </DsPopover.Trigger>
          <DsPopover placement='right'>
            <Trans
              i18nKey='settings_page.alert_settings_info'
              components={{
                a: (
                  <a
                    href='https://info.altinn.no/hjelp/'
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                ),
              }}
            />
          </DsPopover>
        </DsPopover.TriggerContext>
      </div>
      <div className={classes.settingsListContainer}>
        <List size='sm'>
          <SettingsItem
            id='settings-email-alerts'
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
            id='settings-sms-alerts'
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
          canDeleteLastAddress={
            modalMode === 'email' ? phoneNumbers.length > 0 : emailAddresses.length > 0 // Must have at least one address of either type
          }
        />
      </div>
    </div>
  );
};

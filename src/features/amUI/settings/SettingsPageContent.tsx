import React from 'react';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { Divider, DsHeading, List, SettingsItem } from '@altinn/altinn-components';

import classes from './SettingsPageContent.module.css';
import { BellIcon, ChatIcon, PaperplaneIcon, PhoneIcon } from '@navikt/aksel-icons';
import { SettingsModal } from './SettingsModal';

export const SettingsPageContent = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('settings_page.page_title'));
  const { actingParty } = usePartyRepresentation();

  const [openModal, setOpenModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'email' | 'sms'>('email');

  const onSettingsClick = (mode: 'email' | 'sms') => {
    setModalMode(mode);
    setOpenModal(true);
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
            value={'test@email.com'}
            icon={<PaperplaneIcon />}
            badge={{ label: t('settings_page.num_of_addresses', { count: 1 }) }}
            as={'button'}
            onClick={() => onSettingsClick('email')}
          />
          <Divider as='li' />
          <SettingsItem
            title={t('settings_page.alerts_on_sms')}
            value={'2222222222, +47 123 45 678'}
            icon={<ChatIcon />}
            badge={{ label: t('settings_page.num_of_addresses', { count: 1 }) }}
            as={'button'}
            onClick={() => onSettingsClick('sms')}
          />
        </List>
        <SettingsModal
          mode={modalMode}
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      </div>
    </div>
  );
};

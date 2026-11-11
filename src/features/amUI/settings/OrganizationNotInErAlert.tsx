import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './OrganizationNotInErAlert.module.css';

export const OrganizationNotInErAlert = () => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();

  // Organizations outside the Central Coordinating Register for Legal Entities have numbers
  // starting with 0, and Core refuses to store notification addresses for them
  if (!actingParty?.organizationIdentifier?.startsWith('0')) {
    return null;
  }

  const name = formatEntityDisplayName(actingParty);

  return (
    <DsAlert
      data-color='info'
      data-testid='settings-not-in-er-alert'
      className={classes.alert}
    >
      <DsHeading
        level={2}
        data-size='2xs'
      >
        {t('settings_page.not_in_er_heading', { name })}
      </DsHeading>
      <DsParagraph>
        <Trans
          i18nKey='settings_page.not_in_er_info'
          values={{ name }}
          components={{ strong: <strong /> }}
        />
      </DsParagraph>
    </DsAlert>
  );
};

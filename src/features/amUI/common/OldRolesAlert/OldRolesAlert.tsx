import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, DsLink } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import styles from './OldRolesAlert.module.css';

export const OldRolesAlert = () => {
  const { t } = useTranslation();
  const { fromParty, actingParty } = usePartyRepresentation();

  return (
    <DsAlert data-color='info'>
      <div className={styles.container}>
        <DsParagraph>{t('a2Alerts.oldRolesContent')}</DsParagraph>
      </div>
    </DsAlert>
  );
};

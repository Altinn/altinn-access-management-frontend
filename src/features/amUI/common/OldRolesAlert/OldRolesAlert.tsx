import { useTranslation } from 'react-i18next';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router';
import { DsAlert, DsParagraph, DsLink } from '@altinn/altinn-components';

import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import styles from './OldRolesAlert.module.css';

export const OldRolesAlert = () => {
  const { t } = useTranslation();
  const { fromParty, actingParty } = usePartyRepresentation();
  const sectionId = fromParty?.partyUuid === actingParty?.partyUuid ? 9 : 8; // Section for "Users (A2)" in Profile is 9, for "Accesses for others (A2)" it is 8
  const url = getRedirectToA2UsersListSectionUrl(sectionId);

  return (
    <DsAlert data-color='info'>
      <div className={styles.container}>
        <DsParagraph>{t('a2Alerts.oldRolesContent')}</DsParagraph>
        <DsLink
          asChild
          className={styles.link}
        >
          <Link to={url}>
            {t('a2Alerts.oldRolesLinkText')}
            <ExternalLinkIcon aria-hidden />
          </Link>
        </DsLink>
      </div>
    </DsAlert>
  );
};

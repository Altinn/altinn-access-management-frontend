import { useTranslation } from 'react-i18next';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router';
import { DsAlert, DsParagraph, DsLink, Heading } from '@altinn/altinn-components';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import styles from './OldRolesAlert.module.css';

import { getRedirectToServicesAvailableForUserUrl } from '@/resources/utils';
import { useFetchRecipientInfo } from '@/resources/hooks/useFetchRecipientInfo';
import { getHostUrl } from '@/resources/utils/pathUtils';

export const OldRolesAlert = () => {
  const { t } = useTranslation();
  const { toParty } = usePartyRepresentation();
  const { userID, partyID } = useFetchRecipientInfo(toParty?.partyUuid ?? '', null);
  const url =
    userID && partyID
      ? getRedirectToServicesAvailableForUserUrl(userID, partyID)
      : `${getHostUrl()}ui/profile/`;

  return (
    <DsAlert data-color='info'>
      <div className={styles.container}>
        <Heading
          size='xs'
          as='h2'
          className={styles.heading}
        >
          {t('a2Alerts.launchAlertHeading')}
        </Heading>

        <DsParagraph>{t('a2Alerts.launchAlertContent')}</DsParagraph>
        <DsLink asChild>
          <Link
            to={url}
            className={styles.link}
          >
            {t('a2Alerts.launchAlertLinkText')}
            <ExternalLinkIcon aria-hidden />
          </Link>
        </DsLink>
      </div>
    </DsAlert>
  );
};

import { useTranslation } from 'react-i18next';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router';
import { Alert, Heading, Paragraph, Link as DsLink } from '@digdir/designsystemet-react';
import styles from './OldRolesAlert.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
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
    <Alert data-color='info'>
      <div className={styles.container}>
        <Heading
          data-size='xs'
          level={2}
          className={styles.heading}
        >
          {t('a2Alerts.launchAlertHeading')}
        </Heading>

        <Paragraph>{t('a2Alerts.launchAlertContent')}</Paragraph>
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
    </Alert>
  );
};

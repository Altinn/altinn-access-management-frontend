import { useTranslation } from 'react-i18next';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router';
import { Alert, Heading, Paragraph, Link as DsLink } from '@digdir/designsystemet-react';
import styles from './OldRolesAlert.module.css';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { getRedirectToSevicesAvailableForUserUrl } from '@/resources/utils';
import { useFetchRecipientInfo } from '@/resources/hooks/useFetchRecipientInfo';

export const OldRolesAlert = () => {
  const { t } = useTranslation();
  const { toParty } = usePartyRepresentation();
  const { userID, partyID } = useFetchRecipientInfo(toParty?.partyUuid ?? '', null);
  const url = getRedirectToSevicesAvailableForUserUrl(userID, partyID);

  return (
    <Alert data-color='info'>
      <div className={styles.container}>
        <Heading
          data-size='xs'
          level={2}
          style={{
            marginBottom: 'var(--ds-size-2)',
          }}
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

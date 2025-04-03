import { getHostUrl } from '@/resources/utils/pathUtils';
import { useTranslation } from 'react-i18next';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Link } from 'react-router';
import { Alert, Heading, Paragraph, Link as DsLink } from '@digdir/designsystemet-react';
import styles from './OldRolesAlert.module.css';

export const OldRolesAlert = () => {
  const { t } = useTranslation();
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
          <Link to={`${getHostUrl()}ui/profile/`}>
            {t('a2Alerts.launchAlertLinkText')}
            {/* <ExternalLinkIcon title='external link' /> */}
          </Link>
        </DsLink>
      </div>
    </Alert>
  );
};

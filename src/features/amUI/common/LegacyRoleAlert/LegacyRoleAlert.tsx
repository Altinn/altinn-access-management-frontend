import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import styles from './LegacyRoleAlert.module.css';

export const LegacyRoleAlert = () => {
  const { t } = useTranslation();

  return (
    <DsAlert data-color='warning'>
      <div className={styles.container}>
        <DsParagraph>{t('a2Alerts.legacyRoleContent')}</DsParagraph>
      </div>
    </DsAlert>
  );
};

import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import styles from './OldRolesAlert.module.css';

export const OldRolesAlert = () => {
  const { t } = useTranslation();

  return (
    <DsAlert data-color='info'>
      <div className={styles.container}>
        <DsParagraph>{t('a2Alerts.oldRolesContent')}</DsParagraph>
      </div>
    </DsAlert>
  );
};

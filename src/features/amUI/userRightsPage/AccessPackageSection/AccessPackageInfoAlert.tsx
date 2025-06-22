import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

export const AccessPackageInfoAlert = () => {
  const { t } = useTranslation();

  return (
    <DsAlert
      data-color='info'
      data-size='sm'
    >
      <DsParagraph>{t('access_packages.info_alert_text')}</DsParagraph>
    </DsAlert>
  );
};

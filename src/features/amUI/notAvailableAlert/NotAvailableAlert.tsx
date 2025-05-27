import { DsAlert, Heading } from '@altinn/altinn-components';
import { t } from 'i18next';

export const NotAvailableAlert = () => {
  return (
    <DsAlert color='info'>
      <Heading as='h1'>{t('page_not_avialable.title')}</Heading>
      {t('page_not_avialable.text')}
    </DsAlert>
  );
};

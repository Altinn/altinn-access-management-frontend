import { DsAlert, Heading } from '@altinn/altinn-components';
import { t } from 'i18next';

export const NotAvailableForUserTypeAlert = () => {
  return (
    <DsAlert data-color='warning'>
      <Heading as='h1'>{t('page_not_available.title')}</Heading>
      {t('page_not_available.text')}
    </DsAlert>
  );
};

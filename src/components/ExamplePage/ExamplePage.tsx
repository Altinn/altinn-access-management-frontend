import { useTranslation } from 'react-i18next';
import { Page, PageContent, PageHeader } from '@altinn/altinn-design-system';

export const ExamplePage = () => {
  const { t } = useTranslation('common');
  console.log("hey");

  return (
    <Page>
      <PageHeader>{t('profile.employees')}</PageHeader>
      <PageContent>{t('profile.clients')}</PageContent>
    </Page>
  );
};

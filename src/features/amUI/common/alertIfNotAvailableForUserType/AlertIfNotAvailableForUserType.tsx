import { DsAlert, DsSpinner, Heading } from '@altinn/altinn-components';
import { t } from 'i18next';

import { availableForUserTypeCheck } from '@/resources/utils/featureFlagUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

interface AlertIfNotAvailableForUserTypeProps {
  children: React.ReactNode;
}

export const AlertIfNotAvailableForUserType = ({
  children,
}: AlertIfNotAvailableForUserTypeProps) => {
  const { data: reportee, isLoading } = useGetReporteeQuery();

  if (isLoading) return <DsSpinner aria-label={t('loading')} />;

  if (availableForUserTypeCheck(reportee?.type)) {
    return children;
  }

  return (
    <DsAlert data-color='warning'>
      <Heading as='h1'>{t('page_not_available.title')}</Heading>
      {t('page_not_available.text')}
    </DsAlert>
  );
};

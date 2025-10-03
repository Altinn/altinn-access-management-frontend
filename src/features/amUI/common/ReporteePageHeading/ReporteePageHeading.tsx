import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { DsHeading, DsSkeleton } from '@altinn/altinn-components';

import styles from './ReporteePageHeading.module.css';

type Props = {
  title: string;
  reportee?: ReporteeInfo;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  dataSize?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

export const ReporteePageHeading: React.FC<Props> = ({
  title,
  reportee,
  className,
  level = 1,
  dataSize = 'sm',
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const orgNumber = reportee?.organizationNumber ?? '';
  const isMainUnit = (reportee?.subunits?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <DsHeading
        data-size={dataSize}
        className={className || styles.pageHeading}
      >
        <DsSkeleton
          height='32px'
          width='350px'
          className={styles.pageHeadingSkeleton}
        />
        <DsSkeleton
          width='400px'
          className={styles.pageHeadingSkeleton}
        />
      </DsHeading>
    );
  }
  return (
    <DsHeading
      level={level}
      data-size={dataSize}
      className={className || styles.pageHeading}
    >
      {title}
      <br />
      {t('common.org_nr_lowercase', { org_number: orgNumber })}{' '}
      {isMainUnit ? `(${t('common.mainunit_lowercase')})` : ''}
    </DsHeading>
  );
};

export default ReporteePageHeading;

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
  subHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  subHeadingDataSize?: '2xs' | 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

export const ReporteePageHeading: React.FC<Props> = ({
  title,
  reportee,
  className,
  level = 1,
  dataSize = 'sm',
  subHeadingLevel = 2,
  subHeadingDataSize = '2xs',
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const orgNumber = reportee?.organizationNumber ?? '';
  const isMainUnit = (reportee?.subunits?.length ?? 0) > 0;
  const isSubUnit = reportee?.unitType === 'BEDR' || reportee?.unitType === 'AAFY';

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
    <div className={className || styles.pageHeading}>
      <DsHeading
        level={level}
        data-size={dataSize}
      >
        {title}
      </DsHeading>
      {orgNumber && (
        <DsHeading
          level={subHeadingLevel}
          data-size={subHeadingDataSize}
        >
          {t('common.org_nr_lowercase', { org_number: orgNumber.match(/.{1,3}/g)?.join(' ') })}{' '}
          {isMainUnit ? `(${t('common.mainunit_lowercase')})` : ''}
          {isSubUnit ? `(${t('common.subunit_lowercase')})` : ''}
        </DsHeading>
      )}
    </div>
  );
};

export default ReporteePageHeading;

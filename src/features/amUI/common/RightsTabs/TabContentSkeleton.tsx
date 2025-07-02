import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsSkeleton } from '@altinn/altinn-components';

import { SkeletonAccessPackageList } from '../AccessPackageList/SkeletonAccessPackageList';

export const TabContentSkeleton = () => {
  const { t } = useTranslation();

  return (
    <>
      <DsSkeleton>
        <DsHeading
          level={2}
          data-size='2xs'
          id='access_packages_title'
        >
          {t('access_packages.current_access_packages_title', { count: 0 })}
        </DsHeading>
      </DsSkeleton>
      <DsSkeleton
        width={120}
        height={40}
      />
      <SkeletonAccessPackageList />
    </>
  );
};

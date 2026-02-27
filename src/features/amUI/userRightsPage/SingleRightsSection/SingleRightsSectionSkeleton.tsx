import { DsHeading, DsSkeleton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { SkeletonResourceList } from '@/features/amUI/common/ResourceList/SkeletonResourceList';

export const SingleRightsSectionSkeleton = () => {
  const { t } = useTranslation();

  return (
    <>
      <DsSkeleton>
        <DsHeading
          level={2}
          data-size='xs'
          id='single_rights_title'
        >
          {t('single_rights.current_services_title', { count: 0 })}
        </DsHeading>
      </DsSkeleton>
      <DsSkeleton
        width={120}
        height={40}
      />
      <SkeletonResourceList />
    </>
  );
};

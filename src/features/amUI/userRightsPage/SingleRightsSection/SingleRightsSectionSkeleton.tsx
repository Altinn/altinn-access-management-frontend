import { useTranslation } from 'react-i18next';
import { DsHeading, DsSkeleton } from '@altinn/altinn-components';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';

import classes from './SingleRightsSection.module.css';
import { SkeletonResourceList } from '../../common/ResourceList/SkeletonResourceList';

type SingleRightsSectionSkeletonProps = {
  isReportee?: boolean;
};

export const SingleRightsSectionSkeleton = ({
  isReportee = false,
}: SingleRightsSectionSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <div className={classes.singleRightsSectionContainer}>
      <DsSkeleton
        width='40%'
        height='32px'
        className={classes.headingSkeleton}
      />
      <div className={classes.singleRightsList}>
        <SkeletonResourceList />
      </div>
    </div>
  );
};

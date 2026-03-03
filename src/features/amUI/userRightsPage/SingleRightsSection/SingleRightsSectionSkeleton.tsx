import { useTranslation } from 'react-i18next';
import { DsHeading, DsSkeleton } from '@altinn/altinn-components';

import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';

import classes from './SingleRightsSection.module.css';

type SingleRightsSectionSkeletonProps = {
  isReportee?: boolean;
};

export const SingleRightsSectionSkeleton = ({
  isReportee = false,
}: SingleRightsSectionSkeletonProps) => {
  const { t } = useTranslation();

  return (
    <div className={classes.singleRightsSectionContainer}>
      <DsSkeleton>
        <DsHeading
          level={2}
          data-size='xs'
          id='single_rights_title'
        >
          {t('single_rights.current_services_title', { count: 0 })}
        </DsHeading>
      </DsSkeleton>
      <div className={classes.singleRightsList}>
        <ResourceList
          resources={[]}
          isLoading
          enableSearch
          showDetails={false}
          delegationModal={
            !isReportee && (
              <DsSkeleton
                width={120}
                height={40}
              />
            )
          }
        />
      </div>
    </div>
  );
};

import { DsParagraph, DsSkeleton } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceHeading } from '../common/DelegationModal/SingleRights/ResourceHeading';

import classes from './ServicePoaDetailsHeader.module.css';

interface ServicePoaDetailsHeaderProps {
  resource?: ServiceResource;
  isLoading?: boolean;
}

export const ServicePoaDetailsHeader = ({ resource, isLoading }: ServicePoaDetailsHeaderProps) => {
  if (isLoading || !resource) {
    return <ServicePoaDetailsHeaderSkeleton />;
  }

  return (
    <div className={classes.headingContainer}>
      <ResourceHeading
        resource={resource}
        level={1}
      />
      {resource.description && <DsParagraph data-size='sm'>{resource.description}</DsParagraph>}
    </div>
  );
};

const ServicePoaDetailsHeaderSkeleton = () => (
  <div
    className={classes.headingContainer}
    aria-hidden='true'
  >
    <div className={classes.skeletonHeading}>
      <DsSkeleton
        variant='rectangle'
        width={40}
        height={40}
      />
      <div className={classes.skeletonHeadingText}>
        <DsSkeleton
          height={24}
          width={220}
        />
        <DsSkeleton
          variant='text'
          width={140}
        />
      </div>
    </div>
    <DsSkeleton
      variant='text'
      width='80%'
    />
  </div>
);

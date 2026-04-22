import React from 'react';
import { DsParagraph } from '@altinn/altinn-components';
import classes from './RightsList.module.css';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceHeading } from '@/features/amUI/common/DelegationModal/SingleRights/ResourceHeading';

interface ResourceDetailsProps {
  resource: ServiceResource;
}

export const ResourceDetails = ({ resource }: ResourceDetailsProps): React.ReactNode => {
  return (
    <div>
      <ResourceHeading resource={resource} />
      <DsParagraph
        data-size='sm'
        className={classes.resourceInfoText}
      >
        {resource.description}
      </DsParagraph>
    </div>
  );
};

import React from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceHeading } from '@/features/amUI/common/DelegationModal/SingleRights/ResourceHeading';

import classes from './RightsList.module.css';

interface ResourceDetailsProps {
  resource: ServiceResource;
}

export const ResourceDetails = ({ resource }: ResourceDetailsProps): React.ReactNode => {
  return (
    <div>
      <div data-size='sm'>
        <ResourceHeading resource={resource} />
      </div>
      <DsParagraph
        data-size='sm'
        className={classes.resourceInfoText}
      >
        {resource.description}
      </DsParagraph>
    </div>
  );
};

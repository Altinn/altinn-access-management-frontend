import React from 'react';
import { Avatar, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './RightsList.module.css';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface ResourceDetailsProps {
  resource: ServiceResource;
}

export const ResourceDetails = ({ resource }: ResourceDetailsProps): React.ReactNode => {
  return (
    <>
      <div className={classes.resourceInfoHeader}>
        <Avatar
          size='xl'
          type='company'
          imageUrl={resource.resourceOwnerLogoUrl}
          imageUrlAlt={resource.resourceOwnerName}
          name={resource.resourceOwnerName ?? ''}
        />
        <div>
          <DsHeading
            level={1}
            data-size='xs'
          >
            {resource.title}
          </DsHeading>
          <DsParagraph data-size='xs'>{resource.resourceOwnerName}</DsParagraph>
        </div>
      </div>
      <DsParagraph data-size='sm'>{resource.description}</DsParagraph>
    </>
  );
};

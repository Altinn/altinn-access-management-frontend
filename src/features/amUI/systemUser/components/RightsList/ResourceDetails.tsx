import React from 'react';
import { Avatar } from '@altinn/altinn-components';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from './RightsList.module.css';

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
          <Heading
            level={1}
            data-size='xs'
          >
            {resource.title}
          </Heading>
          <Paragraph data-size='xs'>{resource.resourceOwnerName}</Paragraph>
        </div>
      </div>
      <Paragraph data-size='sm'>{resource.description}</Paragraph>
    </>
  );
};

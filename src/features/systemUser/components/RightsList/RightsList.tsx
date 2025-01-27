import React from 'react';
import { ResourceListItem } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from './RightsList.module.css';

interface RightsListProps {
  resources: ServiceResource[];
}

export const RightsList = ({ resources }: RightsListProps): React.ReactNode => {
  return (
    <ul className={classes.unstyledList}>
      {resources.map((resource) => {
        return (
          <li key={resource.identifier}>
            <ResourceListItem
              id={resource.identifier}
              ownerName={resource.resourceOwnerName}
              resourceName={resource.title}
              ownerLogoUrl={resource.resourceOwnerLogoUrl}
              size='md'
            />
          </li>
        );
      })}
    </ul>
  );
};

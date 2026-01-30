import { useProviderLogoUrl } from '@/resources/hooks';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { Avatar, DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './ResourceInfo.module.css';

export const ResourceHeading = ({ resource }: { resource: ServiceResource }) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();

  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');

  return (
    <div className={classes.infoHeading}>
      <div className={classes.resourceIcon}>
        {emblem || resource.resourceOwnerLogoUrl ? (
          <img
            src={emblem ?? resource.resourceOwnerLogoUrl}
            alt={resource.resourceOwnerName ?? ''}
            width={40}
            height={40}
          />
        ) : (
          <Avatar
            type='company'
            imageUrl={resource.resourceOwnerLogoUrl}
            name={resource.resourceOwnerName ?? ''}
          />
        )}
      </div>
      <div className={classes.resource}>
        <div className={classes.infoHeading}>
          <DsHeading
            level={3}
            data-size='sm'
          >
            {resource.title}
          </DsHeading>
        </div>

        <DsParagraph>{resource.resourceOwnerName}</DsParagraph>
      </div>
    </div>
  );
};

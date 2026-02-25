import { useProviderLogoUrl } from '@/resources/hooks';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { Avatar, DsHeading, DsParagraph, Icon } from '@altinn/altinn-components';

import classes from './ResourceInfo.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

export const ResourceHeading = ({ resource }: { resource: ServiceResource }) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const isSmall = useIsMobileOrSmaller();

  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');

  const icon = (small: boolean) => (
    <>
      {emblem || resource.resourceOwnerLogoUrl ? (
        <Icon
          iconUrl={emblem ?? resource.resourceOwnerLogoUrl}
          size={small ? 'sm' : 'xl'}
        />
      ) : (
        <Avatar
          type='company'
          name={resource.resourceOwnerName}
          size={small ? 'sm' : undefined}
          className={!small ? classes.lgAvatar : undefined}
        />
      )}
    </>
  );

  return (
    <div className={classes.infoHeading}>
      {!isSmall && <div className={classes.resourceIcon}>{icon(false)}</div>}

      <div className={classes.resource}>
        <div className={classes.infoHeading}>
          <DsHeading
            level={3}
            data-size={isSmall ? '2xs' : 'sm'}
          >
            {resource.title}
          </DsHeading>
        </div>

        <div className={classes.resourceOwner}>
          {isSmall && icon(true)}
          <DsParagraph data-size={isSmall ? 'xs' : 'md'}>{resource.resourceOwnerName}</DsParagraph>
        </div>
      </div>
    </div>
  );
};

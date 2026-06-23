import { useProviderLogoUrl } from '@/resources/hooks';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { Avatar, Badge, Color, DsHeading, DsParagraph, Icon } from '@altinn/altinn-components';

import classes from './ResourceInfo.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { isExpiredResource } from '../../ResourceList/utils';
import { useTranslation } from 'react-i18next';

export const ResourceHeading = ({ resource }: { resource: ServiceResource }) => {
  const { t } = useTranslation();
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const isSmall = useIsMobileOrSmaller();

  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');

  const icon = (small: boolean) => (
    <>
      {emblem || resource.resourceOwnerLogoUrl ? (
        <Icon
          iconUrl={emblem ?? resource.resourceOwnerLogoUrl}
          size={small ? 'sm' : 'xl'}
          className={!small ? classes.lgAvatar : undefined}
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

  const titleBadge = isExpiredResource(resource)
    ? { label: t('resource_list.expired_badge'), color: 'neutral' as Color }
    : undefined;

  return (
    <div className={classes.infoHeading}>
      {!isSmall && <div>{icon(false)}</div>}

      <div className={classes.resource}>
        <div className={classes.infoHeading}>
          <DsHeading
            level={3}
            data-size={isSmall ? '2xs' : 'sm'}
          >
            {resource.title}
          </DsHeading>
          {titleBadge && (
            <Badge
              label={titleBadge.label}
              color={titleBadge.color}
            />
          )}
        </div>

        <div className={classes.resourceOwner}>
          {isSmall && icon(true)}
          <DsParagraph data-size={isSmall ? 'xs' : 'md'}>{resource.resourceOwnerName}</DsParagraph>
        </div>
      </div>
    </div>
  );
};

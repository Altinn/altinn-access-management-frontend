import { Avatar, Badge, type Color, DsHeading, DsParagraph, Icon } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { isExpiredResource } from '../../ResourceList/utils';

import classes from './ResourceInfo.module.css';

interface ResourceHeadingProps {
  resource: ServiceResource;
  /** Heading level for the resource title. Defaults to 3, which fits the dialogs it is used in. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const ResourceHeading = ({ resource, level = 3 }: ResourceHeadingProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  const ownerName = resource.resourceOwnerName ?? '';
  const logoUrl = resource.resourceOwnerLogoUrl || undefined;

  const icon = (small: boolean) =>
    logoUrl ? (
      <Icon
        iconUrl={logoUrl}
        size={small ? 'sm' : 'xl'}
        className={!small ? classes.lgAvatar : undefined}
      />
    ) : (
      <Avatar
        type='company'
        name={ownerName}
        size={small ? 'sm' : undefined}
        className={!small ? classes.lgAvatar : undefined}
      />
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
            level={level}
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
          <DsParagraph data-size={isSmall ? 'xs' : 'md'}>{ownerName}</DsParagraph>
        </div>
      </div>
    </div>
  );
};

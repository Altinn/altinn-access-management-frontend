import { useProviderLogoUrl } from '@/resources/hooks';
import { Avatar, Badge, Color, DsHeading, DsParagraph, Icon } from '@altinn/altinn-components';

import classes from './ResourceInfo.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ResourceListItemResource } from '../../ResourceList/types';
import {
  extractLogoUrl,
  extractOrgCode,
  extractOwnerName,
  extractResourceName,
  isExpiredResource,
} from '../../ResourceList/utils';
import { useTranslation } from 'react-i18next';

interface ResourceHeadingProps {
  resource: ResourceListItemResource;
  /** Heading level for the resource title. Defaults to 3, which fits the dialogs it is used in. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Already resolved owner logo, for callers that have looked it up themselves. */
  providerLogoUrl?: string;
}

export const ResourceHeading = ({ resource, level = 3, providerLogoUrl }: ResourceHeadingProps) => {
  const { t } = useTranslation();
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const isSmall = useIsMobileOrSmaller();

  const ownerName = extractOwnerName(resource);
  const logoUrl =
    providerLogoUrl ?? getProviderLogoUrl(extractOrgCode(resource)) ?? extractLogoUrl(resource);

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
            {extractResourceName(resource)}
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

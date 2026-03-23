import { useProviderLogoUrl } from '@/resources/hooks';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { Avatar, DsHeading, DsParagraph, formatDisplayName, Icon } from '@altinn/altinn-components';

import classes from './InstanceHeading.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';
import { t } from 'i18next';

export const InstanceHeading = ({
  resource,
  fromPartyName,
  fromPartyType,
}: {
  resource: ServiceResource;
  fromPartyName?: string;
  fromPartyType?: PartyType;
}) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');
  const fromName = formatDisplayName({
    fullName: fromPartyName ?? '',
    type: fromPartyType === PartyType.Person ? 'person' : 'company',
  });

  const icon = () => (
    <>
      {emblem || resource.resourceOwnerLogoUrl ? (
        <Icon
          iconUrl={emblem ?? resource.resourceOwnerLogoUrl}
          size={'sm'}
        />
      ) : (
        <Avatar
          type='company'
          name={resource.resourceOwnerName}
          size={'sm'}
        />
      )}
    </>
  );

  return (
    <div className={classes.infoHeading}>
      <div className={classes.resource}>
        <div className={classes.infoHeading}>
          <DsHeading
            level={3}
            data-size={'sm'}
          >
            {resource.title}
          </DsHeading>
        </div>

        <div className={classes.resourceOwner}>
          {icon()}
          <DsParagraph
            data-size={'sm'}
            className={classes.instanceTag}
          >
            {resource.resourceOwnerName}{' '}
            <span className={classes.instanceOwnerName}>
              {t('instance_detail_page.provider_name', {
                name: fromName,
              })}
            </span>
          </DsParagraph>
        </div>
      </div>
    </div>
  );
};

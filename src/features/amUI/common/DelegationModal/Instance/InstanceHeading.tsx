import { useProviderLogoUrl } from '@/resources/hooks';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { DialogLookup } from '@/rtk/features/instanceApi';
import { Avatar, DsHeading, DsParagraph, formatDisplayName, Icon } from '@altinn/altinn-components';

import classes from './InstanceHeading.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useTranslation } from 'react-i18next';
import { resolveInstanceTitle } from '@/features/amUI/common/InstanceList/instanceListUtils';

export const InstanceHeading = ({
  resource,
  instanceUrn,
  dialogLookup,
  fromPartyName,
  fromPartyType,
}: {
  resource: ServiceResource;
  instanceUrn: string;
  dialogLookup?: DialogLookup;
  fromPartyName?: string;
  fromPartyType?: PartyType;
}) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const { t, i18n } = useTranslation();
  const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');
  const fromName = formatDisplayName({
    fullName: fromPartyName ?? '',
    type: fromPartyType === PartyType.Person ? 'person' : 'company',
  });
  const title = resolveInstanceTitle(
    {
      instance: {
        refId: instanceUrn,
        type: null,
      },
      dialogLookup,
    },
    resource,
    t,
    i18n.language,
  );

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
          name={resource.resourceOwnerName ?? ''}
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
            {title}
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

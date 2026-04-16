import { DsHeading, DsParagraph, Icon, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { DelegationInstance, DialogLookup } from '@/rtk/features/instanceApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { resolveInstanceTitle } from '../common/InstanceList/instanceListUtils';

import classes from './InstanceDetailHeader.module.css';

interface InstanceDetailHeaderProps {
  resource: ServiceResource;
  instance?: DelegationInstance;
  dialogLookup?: DialogLookup;
  providerLogoUrl?: string;
  fromPartyName?: string;
  fromPartyTypeName?: PartyType;
}

export const InstanceDetailHeader = ({
  resource,
  instance,
  dialogLookup,
  providerLogoUrl,
  fromPartyName,
  fromPartyTypeName,
}: InstanceDetailHeaderProps) => {
  const { t, i18n } = useTranslation();
  const title = resolveInstanceTitle(
    instance
      ? {
          instance,
          dialogLookup,
        }
      : undefined,
    resource,
    t,
    i18n.language,
  );

  return (
    <div className={classes.infoHeading}>
      <DsHeading
        level={1}
        data-size='sm'
      >
        {title}
      </DsHeading>
      <div className={classes.resourceOwner}>
        <Icon
          iconUrl={providerLogoUrl ?? resource.resourceOwnerLogoUrl}
          size='sm'
        />
        <DsParagraph data-size='sm'>
          {resource.resourceOwnerName}{' '}
          <span className={classes.providerName}>
            {t('instance_detail_page.provider_name', {
              name: formatDisplayName({
                fullName: fromPartyName ?? '',
                type: fromPartyTypeName === PartyType.Person ? 'person' : 'company',
              }),
            })}
          </span>
        </DsParagraph>
      </div>
      {resource.description && <DsParagraph data-size='sm'>{resource.description}</DsParagraph>}
    </div>
  );
};

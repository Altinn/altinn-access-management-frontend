import { DsHeading, DsParagraph, Icon, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PartyType } from '@/rtk/features/userInfoApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { DialogLookup } from '@/rtk/features/instanceApi';
import { resolveInstanceTitle } from '@/resources/utils/instanceTitleUtils';

import classes from './InstanceDetailHeader.module.css';

interface InstanceDetailHeaderProps {
  resource: ServiceResource;
  resourceId: string;
  instanceUrn?: string;
  dialogLookup?: DialogLookup | null;
  providerLogoUrl?: string;
  fromPartyName?: string;
  fromPartyTypeName?: PartyType;
}

export const InstanceDetailHeader = ({
  resource,
  resourceId,
  instanceUrn,
  dialogLookup,
  providerLogoUrl,
  fromPartyName,
  fromPartyTypeName,
}: InstanceDetailHeaderProps) => {
  const { t, i18n } = useTranslation();
  const title = resolveInstanceTitle(dialogLookup, resource, instanceUrn, t, i18n.language);

  return (
    <div className={classes.infoHeading}>
      <DsHeading
        level={1}
        data-size='sm'
      >
        {t('instance_detail_page.resource_title', { title })}
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

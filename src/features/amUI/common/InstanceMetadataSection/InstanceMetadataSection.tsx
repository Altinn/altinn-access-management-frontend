import type { ReactNode } from 'react';
import { Avatar, DsHeading, DsParagraph, Icon, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useProviderLogoUrl } from '@/resources/hooks';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { DialogLookup } from '@/rtk/features/instanceApi';
import { resolveInstanceTitle } from '@/resources/utils/instanceTitleUtils';

import classes from './InstanceMetadataSection.module.css';

interface InstanceMetadataSectionProps {
  resource: ServiceResource;
  instanceUrn?: string;
  dialogLookup?: DialogLookup | null;
  fromPartyName?: string;
  fromPartyType?: PartyType;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  statusSection?: ReactNode;
}

export const InstanceMetadataSection = ({
  resource,
  instanceUrn,
  dialogLookup,
  fromPartyName,
  fromPartyType,
  titleLevel = 3,
  statusSection,
}: InstanceMetadataSectionProps) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const { t, i18n } = useTranslation();

  const shortId = instanceUrn?.slice(-10);
  const title = resolveInstanceTitle(dialogLookup, resource, instanceUrn, t, i18n.language);
  const providerLogoUrl = resource.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;
  const fromName = formatDisplayName({
    fullName: fromPartyName ?? '',
    type: fromPartyType === PartyType.Person ? 'person' : 'company',
  });

  return (
    <div className={classes.container}>
      <DsHeading
        level={titleLevel}
        data-size='sm'
      >
        {title}
      </DsHeading>
      <div className={classes.resourceOwner}>
        {providerLogoUrl || resource.resourceOwnerLogoUrl ? (
          <Icon
            iconUrl={providerLogoUrl ?? resource.resourceOwnerLogoUrl}
            size='sm'
          />
        ) : (
          <Avatar
            type='company'
            name={resource.resourceOwnerName}
            size='sm'
          />
        )}
        <DsParagraph
          data-size='sm'
          className={classes.ownerTag}
        >
          {resource.resourceOwnerName}{' '}
          <span className={classes.ownerName}>
            {t('instance_detail_page.provider_name', {
              name: fromName,
            })}
          </span>
        </DsParagraph>
      </div>
      {statusSection}
      {(resource.title || instanceUrn) && (
        <dl className={classes.metadataList}>
          {resource.title && (
            <div className={classes.metadataRow}>
              <dt className={classes.metadataTerm}>
                {t('instance_detail_page.service_title_label')}
              </dt>
              <dd className={classes.metadataValue}>{resource.title}</dd>
            </div>
          )}
          {instanceUrn && (
            <div className={classes.metadataRow}>
              <dt className={classes.metadataTerm}>
                {t('instance_detail_page.instance_id_label')}
              </dt>
              <dd className={classes.metadataValue}>{shortId}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
};

import type { ReactNode } from 'react';
import { Avatar, DsHeading, DsParagraph, Icon, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useProviderLogoUrl } from '@/resources/hooks';
import { enableDialogportenDialogLookup } from '@/resources/utils/featureFlagUtils';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import {
  getInstanceShortId,
  type InstancePresentationData,
  resolveInstanceTitle,
} from '../InstanceList/instanceListUtils';

import classes from './InstanceDescription.module.css';

interface InstanceMetadataDescriptionProps {
  resource: ServiceResource;
  instanceData?: InstancePresentationData;
  fromPartyName?: string;
  fromPartyType?: PartyType;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  statusSection?: ReactNode;
}

export const InstanceMetadataDescription = ({
  resource,
  instanceData,
  fromPartyName,
  fromPartyType,
  titleLevel = 3,
  statusSection,
}: InstanceMetadataDescriptionProps) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();
  const { t, i18n } = useTranslation();
  const dialogportenLookupEnabled = enableDialogportenDialogLookup();
  const shortId = getInstanceShortId(instanceData?.instance.refId);
  const title = resolveInstanceTitle(instanceData, resource, t, i18n.language);
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
      {dialogportenLookupEnabled
        ? (resource.title || instanceData?.instance.refId) && (
            <dl className={classes.metadataList}>
              {resource.title && (
                <div className={classes.metadataRow}>
                  <dt className={classes.metadataTerm}>{t('instance.service_title_label')}</dt>
                  <dd className={classes.metadataValue}>{resource.title}</dd>
                </div>
              )}
              {instanceData?.instance.refId && (
                <div className={classes.metadataRow}>
                  <dt className={classes.metadataTerm}>{t('instance.instance_id_label')}</dt>
                  <dd className={classes.metadataValue}>{shortId}</dd>
                </div>
              )}
            </dl>
          )
        : resource.description && (
            <DsParagraph
              data-size='sm'
              className={classes.description}
            >
              {resource.description}
            </DsParagraph>
          )}
    </div>
  );
};

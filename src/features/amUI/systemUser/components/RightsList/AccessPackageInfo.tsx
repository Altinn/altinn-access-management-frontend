import React from 'react';
import { DsHeading, DsParagraph, ResourceList } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetOrgDataQuery } from '@/rtk/features/altinnCdnApi';

import type { SystemUserAccessPackage } from '../../types';

import classes from './RightsList.module.css';

interface AccessPackageInfoProps {
  accessPackage: SystemUserAccessPackage;
  onSelectResource: (resource: ServiceResource) => void;
}
export const AccessPackageInfo = ({
  accessPackage,
  onSelectResource,
}: AccessPackageInfoProps): React.ReactElement => {
  const { t } = useTranslation();

  const { data: orgData, isLoading } = useGetOrgDataQuery();

  const getProviderLogoUrl = (orgCode: string | null): string | undefined => {
    if (!orgData || isLoading) {
      return undefined;
    }
    const org = orgData[orgCode ?? ''];
    return org?.emblem ?? org?.logo ?? undefined;
  };

  return (
    <div className={classes.accessPackages}>
      <div className={classes.resourceInfoHeader}>
        <PackageIcon fontSize={28} />
        <DsHeading
          level={1}
          data-size='xs'
        >
          {accessPackage.name}
        </DsHeading>
      </div>
      <DsParagraph data-size='sm'>{accessPackage.description}</DsParagraph>
      <DsHeading
        data-size='2xs'
        level={2}
      >
        {accessPackage.resources.length === 1
          ? t('systemuser_detailpage.accesspackage_resources_singular')
          : t('systemuser_detailpage.accesspackage_resources_plural', {
              resourcesCount: accessPackage.resources.length,
            })}
      </DsHeading>
      <ResourceList
        defaultItemSize='sm'
        items={accessPackage.resources.map((resource) => {
          return {
            id: resource.identifier,
            as: 'button',
            titleAs: 'h3',
            ownerLogoUrl:
              getProviderLogoUrl(resource.provider?.code ?? '') ?? resource.resourceOwnerLogoUrl,
            ownerLogoUrlAlt: resource.resourceOwnerName ?? '',
            ownerName: resource.resourceOwnerName ?? '',
            resourceName: resource.title,
            onClick: () => onSelectResource(resource),
          };
        })}
      />
    </div>
  );
};

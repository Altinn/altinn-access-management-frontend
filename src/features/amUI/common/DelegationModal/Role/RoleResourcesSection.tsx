import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import type { RoleResourceMetadata } from '@/rtk/features/roleApi';

import { SkeletonResourceList } from '../../ResourceList/SkeletonResourceList';
import { ResourceList } from '../../ResourceList/ResourceList';

interface RoleResourcesSectionProps {
  roleResources?: RoleResourceMetadata[];
  isLoading: boolean;
}

export const RoleResourcesSection = ({ roleResources, isLoading }: RoleResourcesSectionProps) => {
  const { t } = useTranslation();

  const roleResourceList = useMemo<PackageResource[]>(() => {
    if (!roleResources) {
      return [];
    }

    return roleResources.map((resource) => {
      const provider = resource.provider;
      return {
        id: resource.id,
        name: resource.name,
        title: resource.name,
        description: resource.description ?? '',
        provider: {
          id: provider?.id ?? resource.providerId,
          name: provider?.name ?? '',
          refId: provider?.refId ?? resource.refId ?? '',
          logoUrl: provider?.logoUrl ?? '',
          code: provider?.code ?? '',
          typeId: provider?.typeId ?? resource.typeId ?? '',
        },
        resourceOwnerName: provider?.name ?? '',
        resourceOwnerLogoUrl: provider?.logoUrl ?? '',
        resourceOwnerOrgcode: provider?.code ?? '',
        resourceOwnerOrgNumber: provider?.refId ?? '',
        resourceOwnerType: provider?.type?.name ?? resource.type?.name ?? '',
      };
    });
  }, [roleResources]);

  if (isLoading) {
    return <SkeletonResourceList />;
  }

  return (
    <>
      <DsHeading
        level={3}
        data-size='xs'
      >
        {t('role.resources_title', {
          count: roleResources?.length ?? 0,
        })}
      </DsHeading>
      <ResourceList
        resources={roleResourceList}
        noResourcesText={t('role.resources_empty')}
        enableMaxHeight={true}
        showDetails={false}
        interactive={false}
        size='xs'
        as='div'
      />
    </>
  );
};

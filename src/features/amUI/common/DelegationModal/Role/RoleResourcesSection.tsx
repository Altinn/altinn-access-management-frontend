import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsParagraph, DsSearch } from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import type { RoleResourceMetadata } from '@/rtk/features/roleApi';

import { useResourceList } from '../AccessPackages/useResourceList';
import { List } from '../../List';
import classes from './RoleInfo.module.css';
import { SkeletonResourceList } from '../../ResourceList/SkeletonResourceList';

interface RoleResourcesSectionProps {
  roleResources?: RoleResourceMetadata[];
  isLoading: boolean;
}

export const RoleResourcesSection = ({ roleResources, isLoading }: RoleResourcesSectionProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

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

  const trimmedSearchValue = searchValue.trim();
  const filteredRoleResources = useMemo(() => {
    const normalizedSearch = trimmedSearchValue.toLowerCase();
    if (!normalizedSearch) {
      return roleResourceList;
    }

    return roleResourceList.filter((resource) => {
      const resourceName = (resource.name || resource.title || '').toLowerCase();
      const providerName = (resource.provider?.name || '').toLowerCase();

      return resourceName.includes(normalizedSearch) || providerName.includes(normalizedSearch);
    });
  }, [roleResourceList, trimmedSearchValue]);

  const resources = useResourceList(filteredRoleResources);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

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
      {roleResources && roleResources.length === 0 && (
        <DsParagraph
          data-size='xs'
          className={classes.noResourcesMessage}
        >
          {t('role.resources_empty')}
        </DsParagraph>
      )}
      {roleResources && roleResources.length > 0 && (
        <div className={classes.resourcesSection}>
          <DsSearch className={classes.searchBar}>
            <DsSearch.Input
              aria-label={t('resource_list.resource_search_placeholder')}
              placeholder={t('resource_list.resource_search_placeholder')}
              onChange={handleSearchChange}
            />
            <DsSearch.Clear
              onClick={() => {
                setSearchValue('');
              }}
            />
          </DsSearch>
          {filteredRoleResources.length === 0 && (
            <DsParagraph
              data-size='xs'
              className={classes.noResourcesMessage}
            >
              {trimmedSearchValue &&
                t('resource_list.no_resources_filtered', { searchTerm: trimmedSearchValue })}
            </DsParagraph>
          )}
          <div className={classes.service_list}>
            <div className={classes.services}>
              <List>{resources}</List>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

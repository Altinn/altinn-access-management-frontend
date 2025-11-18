import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsSearch } from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import type { RoleResourceMetadata } from '@/rtk/features/roleApi';

import { useResourceList } from '../AccessPackages/useResourceList';
import { List } from '../../List';
import classes from './RoleInfo.module.css';

interface RoleResourcesSectionProps {
  roleResources?: RoleResourceMetadata[];
}

export const RoleResourcesSection = ({ roleResources }: RoleResourcesSectionProps) => {
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

  const filteredRoleResources = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return roleResourceList;
    }

    return roleResourceList.filter((resource) => {
      const resourceName = (resource.name || resource.title || '').toLowerCase();
      const providerName = (resource.provider?.name || '').toLowerCase();

      return resourceName.includes(normalizedSearch) || providerName.includes(normalizedSearch);
    });
  }, [roleResourceList, searchValue]);

  const resources = useResourceList(filteredRoleResources);

  const searchLabel = t('role.resources_search_placeholder', {
    defaultValue: String(t('common.search')),
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <>
      <DsHeading
        level={3}
        data-size='xs'
      >
        {t('role.resources_title', {
          count: filteredRoleResources.length,
        })}
      </DsHeading>
      <div className={classes.resourcesSection}>
        <DsSearch className={classes.searchBar}>
          <DsSearch.Input
            aria-label={searchLabel}
            placeholder={searchLabel}
            onChange={handleSearchChange}
          />
          <DsSearch.Clear
            onClick={() => {
              setSearchValue('');
            }}
          />
        </DsSearch>
        <div className={classes.service_list}>
          <div className={classes.services}>
            <List>{resources}</List>
          </div>
        </div>
      </div>
    </>
  );
};

import React from 'react';
import {
  DsParagraph,
  List,
  ResourceListItem,
  type ResourceListItemProps,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

import { ResourceDetails } from './ResourceDetails';
import classes from './ResourceList.module.css';
import { SkeletonResourceList } from './SkeletonResourceList';
import { useFilteredResources } from './useFilteredResources';
import { ResourceFilterToolbar } from '../ResourceFilterToolbar/ResourceFilterToolbar';
import type { ResourceListItemResource } from './types';

import cn from 'classnames';

export interface ResourceListProps<
  TResource extends ResourceListItemResource = ResourceListItemResource,
> {
  resources: TResource[];
  isLoading?: boolean;
  noResourcesText?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSelect?: (resource: TResource) => void;
  showDetails?: boolean;
  size?: ResourceListItemProps['size'];
  titleAs?: ResourceListItemProps['titleAs'];
  interactive?: boolean;
  as?: ResourceListItemProps['as'];
  showMoreButton?: boolean;
  skeletonCount?: number;
  resolveLogos?: boolean;
  enableMaxHeight?: boolean;
  renderControls?: (resource: TResource) => React.ReactNode;
  getBadge?: (resource: TResource, index: number) => ResourceListItemProps['badge'];
}

const extractResourceName = (resource: ResourceListItemResource): string => {
  if ('name' in resource && typeof resource.name === 'string' && resource.name.trim().length > 0) {
    return resource.name;
  }

  if ('title' in resource && typeof resource.title === 'string') {
    return resource.title;
  }

  if (
    'resourceName' in resource &&
    typeof (resource as { resourceName?: string }).resourceName === 'string'
  ) {
    return (resource as { resourceName?: string }).resourceName ?? '';
  }

  return '';
};

const extractOwnerName = (resource: ResourceListItemResource): string => {
  if ('provider' in resource && resource.provider?.name) {
    return resource.provider.name;
  }

  if ('resourceOwnerName' in resource && resource.resourceOwnerName) {
    return resource.resourceOwnerName;
  }

  return '';
};

const extractDescription = (resource: ResourceListItemResource): string => {
  if ('description' in resource && typeof resource.description === 'string') {
    return resource.description;
  }

  return '';
};

const extractOrgCode = (resource: ResourceListItemResource): string => {
  if ('provider' in resource && resource.provider?.code) {
    return resource.provider.code;
  }

  if ('resourceOwnerOrgcode' in resource && resource.resourceOwnerOrgcode) {
    return resource.resourceOwnerOrgcode;
  }

  return '';
};

const extractLogoUrl = (resource: ResourceListItemResource): string | undefined => {
  if ('provider' in resource && resource.provider?.logoUrl) {
    return resource.provider.logoUrl;
  }

  if ('resourceOwnerLogoUrl' in resource && resource.resourceOwnerLogoUrl) {
    return resource.resourceOwnerLogoUrl;
  }

  return undefined;
};

const extractLogoAlt = (resource: ResourceListItemResource): string | undefined =>
  extractOwnerName(resource);

const extractResourceId = (resource: ResourceListItemResource): string | undefined => {
  if ('id' in resource && resource.id) {
    return resource.id;
  }

  if ('identifier' in resource && resource.identifier) {
    return resource.identifier;
  }

  return undefined;
};

export const ResourceList = <
  TResource extends ResourceListItemResource = ResourceListItemResource,
>({
  resources,
  isLoading,
  noResourcesText,
  enableSearch = true,
  onSelect,
  showDetails,
  size,
  titleAs,
  interactive,
  as,
  resolveLogos = true,
  enableMaxHeight = false,
  renderControls,
  getBadge,
}: ResourceListProps<TResource>) => {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState('');
  const [filterState, setFilterState] = React.useState<{ owner?: string[] }>({});
  const [selected, setSelected] = React.useState<TResource | null>(null);
  const { getProviderLogoUrl, isLoading: orgLoading } = useProviderLogoUrl();
  const logoResolver = React.useMemo(
    () => (resolveLogos ? getProviderLogoUrl : () => undefined),
    [getProviderLogoUrl, resolveLogos],
  );

  const shouldShowDetails = showDetails ?? !onSelect;
  const derivedInteractive = interactive ?? Boolean(onSelect || shouldShowDetails);

  const handleSelect = React.useCallback(
    (resource: TResource) => {
      if (onSelect) {
        onSelect(resource);
        return;
      }

      if (shouldShowDetails) {
        setSelected(resource);
      }
    },
    [onSelect, shouldShowDetails],
  );

  const closeDetails = React.useCallback(() => setSelected(null), []);

  const { resources: filteredResources } = useFilteredResources<TResource>({
    resources,
    serviceOwnerFilter: filterState?.['owner'] ?? [],
    searchString: enableSearch ? search : '',
    getResourceName: extractResourceName,
    getOwnerName: extractOwnerName,
    getOwnerOrgCode: extractOrgCode,
    getDescription: extractDescription,
  });

  const isSkeletonVisible = isLoading || (resolveLogos && orgLoading);

  const serviceOwnerOptions = React.useMemo(() => {
    const uniqueOwners = new Map<string, { value: string; label: string }>();
    resources.forEach((res) => {
      const code = extractOrgCode(res);
      const name = extractOwnerName(res);
      if (code && !uniqueOwners.has(code)) {
        uniqueOwners.set(code, { value: code, label: name });
      }
    });
    return Array.from(uniqueOwners.values());
  }, [resources]);

  return (
    <div className={classes.container}>
      {enableSearch && resources.length > 0 && (
        <ResourceFilterToolbar
          search={search}
          setSearch={setSearch}
          filterState={filterState}
          setFilterState={setFilterState}
          serviceOwnerOptions={serviceOwnerOptions}
        />
      )}

      {isSkeletonVisible ? (
        <SkeletonResourceList />
      ) : (
        <>
          {resources.length === 0 && !search && (
            <DsParagraph data-size='md'>
              {noResourcesText ?? t('resource_list.no_resources')}
            </DsParagraph>
          )}
          {enableSearch && search.length > 0 && filteredResources.length === 0 && (
            <DsParagraph data-size='md'>
              {t('resource_list.no_resources_filtered', { searchTerm: search })}
            </DsParagraph>
          )}
          <div
            className={cn(classes.resourceListContainer, { [classes.maxHeight]: enableMaxHeight })}
          >
            {filteredResources.length > 0 && (
              <List>
                {filteredResources.map((resource, index) => {
                  const derivedId = extractResourceId(resource);
                  const resourceId = derivedId ? String(derivedId) : `resource-${index}`;
                  const resourceName = extractResourceName(resource);
                  const ownerName = extractOwnerName(resource);
                  const orgCode = extractOrgCode(resource);
                  const providerLogo = resolveLogos && orgCode ? logoResolver(orgCode) : undefined;
                  const fallbackLogoUrl = extractLogoUrl(resource);
                  const ownerLogoUrl = providerLogo ?? fallbackLogoUrl;
                  const ownerLogoAlt = extractLogoAlt(resource) ?? ownerName;
                  const itemInteractive = derivedInteractive;
                  const itemAs = as ?? (itemInteractive ? 'button' : 'div');
                  const itemSize = size ?? 'xs';
                  const itemTitleAs = titleAs ?? 'h3';
                  const handleClick = itemInteractive ? () => handleSelect(resource) : undefined;
                  const itemShadow = itemInteractive ? undefined : 'none';

                  return (
                    <ResourceListItem
                      key={resourceId}
                      id={resourceId}
                      resourceName={resourceName}
                      ownerName={ownerName}
                      ownerLogoUrl={ownerLogoUrl}
                      ownerLogoUrlAlt={ownerLogoAlt}
                      as={itemAs}
                      size={itemSize}
                      titleAs={itemTitleAs}
                      interactive={itemInteractive}
                      onClick={handleClick}
                      badge={getBadge?.(resource, index)}
                      controls={renderControls?.(resource)}
                      loading={false}
                      shadow={itemShadow}
                    />
                  );
                })}
              </List>
            )}
          </div>
        </>
      )}

      {shouldShowDetails && (
        <ResourceDetails
          resource={selected}
          onClose={closeDetails}
          providerLogoUrl={
            selected
              ? resolveLogos
                ? (logoResolver(extractOrgCode(selected) ?? '') ?? selected.resourceOwnerLogoUrl)
                : extractLogoUrl(selected)
              : undefined
          }
        />
      )}
    </div>
  );
};

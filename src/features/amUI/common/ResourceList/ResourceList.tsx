import React from 'react';
import {
  DsParagraph,
  DsPopover,
  DsSwitch,
  List,
  ResourceListItem,
  type ResourceListItemProps,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { useRestoreFocusTarget } from '@/features/amUI/common/RestoreFocus';

import { ResourceDetails } from './ResourceDetails';
import classes from './ResourceList.module.css';
import { SkeletonResourceList } from './SkeletonResourceList';
import { useFilteredResources } from './useFilteredResources';
import { ResourceFilterToolbar } from '../ResourceFilterToolbar/ResourceFilterToolbar';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { isExpiredResource } from './utils';

import cn from 'classnames';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';

interface ResourceListItemRowProps extends React.ComponentProps<typeof ResourceListItem> {
  resourceId: string;
  actionControlId?: string;
}

const ResourceListItemRow = ({
  resourceId,
  actionControlId,
  ...props
}: ResourceListItemRowProps) => {
  useRestoreFocusTarget(resourceId);
  useRestoreFocusTarget(actionControlId ?? '');
  return <ResourceListItem {...props} />;
};

export interface ResourceListProps {
  resources: ServiceResource[];
  isLoading?: boolean;
  noResourcesText?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSelect?: (resource: ServiceResource) => void;
  showDetails?: boolean;
  size?: ResourceListItemProps['size'];
  interactive?: boolean | ((resource: ServiceResource) => boolean);
  as?: ResourceListItemProps['as'];
  showMoreButton?: boolean;
  skeletonCount?: number;
  enableMaxHeight?: boolean;
  renderControls?: (resource: ServiceResource) => React.ReactNode;
  getBadge?: (resource: ServiceResource, index: number) => ResourceListItemProps['badge'];
  getDescriptionText?: (resource: ServiceResource, index: number) => string | undefined;
  getHasAccess?: (resource: ServiceResource) => boolean;
  getActionControlId?: (resource: ServiceResource) => string;
  /**
   * Row id, when the resource identifier is not what distinguishes rows. The handled request list
   * keys by request id, so the same resource can appear as several rows.
   */
  getItemId?: (resource: ServiceResource) => string;
  delegationModal?: React.ReactNode;
  border?: ResourceListItemProps['border'];
  ariaLabelledBy?: string;
}

export const ResourceList = ({
  resources,
  isLoading,
  noResourcesText,
  enableSearch = true,
  onSelect,
  showDetails,
  size,
  interactive,
  as,
  enableMaxHeight = false,
  renderControls,
  getBadge,
  getDescriptionText,
  getHasAccess,
  getActionControlId,
  getItemId,
  delegationModal,
  border = 'none',
  ariaLabelledBy,
}: ResourceListProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState('');
  const [filterState, setFilterState] = React.useState<string[]>([]);
  const [includeExpired, setIncludeExpired] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<ServiceResource | null>(null);
  const hasExpiredResources = React.useMemo(
    () => resources && resources.some(isExpiredResource),
    [resources],
  );

  const shouldShowDetails = showDetails ?? !onSelect;
  const derivedInteractive = (resource: ServiceResource) => {
    if (typeof interactive === 'function') {
      return interactive(resource);
    }
    return interactive ?? Boolean(onSelect || shouldShowDetails);
  };

  const handleSelect = React.useCallback(
    (resource: ServiceResource) => {
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

  const { resources: filteredResources } = useFilteredResources({
    resources,
    serviceOwnerFilter: filterState,
    searchString: enableSearch ? search : '',
    includeExpiredResources: enableSearch ? includeExpired : true,
  });

  const isSkeletonVisible = isLoading;

  const serviceOwnerOptions = React.useMemo(() => {
    const uniqueOwners = new Map<string, { value: string; label: string; count: number }>();
    resources.forEach((res) => {
      const code = res.resourceOwnerOrgcode;
      const name = res.resourceOwnerName;
      if (code) {
        const existing = uniqueOwners.get(code);
        if (existing) {
          existing.count = (existing.count ?? 1) + 1;
        } else {
          uniqueOwners.set(code, { value: code, label: name, count: 1 });
        }
      }
    });
    return Array.from(uniqueOwners.values());
  }, [resources]);

  return (
    <div className={classes.container}>
      {enableSearch && (
        <div className={classes.searchAndAdd}>
          <ResourceFilterToolbar
            search={search}
            setSearch={setSearch}
            filterState={filterState}
            setFilterState={setFilterState}
            serviceOwnerOptions={serviceOwnerOptions}
          />
          {hasExpiredResources && (
            <div className={classes.expiredSwitch}>
              <DsSwitch
                data-size='sm'
                checked={includeExpired}
                onChange={(e) => {
                  setIncludeExpired(e.target.checked);
                }}
                label={t('resource_list.show_expired_services')}
              />
              <DsPopover.TriggerContext>
                <DsPopover.Trigger
                  icon
                  variant='tertiary'
                  data-size='sm'
                  aria-label={t('resource_list.show_expired_services_helptext_button')}
                >
                  <QuestionmarkCircleIcon aria-hidden='true' />
                </DsPopover.Trigger>
                <DsPopover>{t('resource_list.show_expired_services_helptext')}</DsPopover>
              </DsPopover.TriggerContext>
            </div>
          )}
          <div className={classes.delegationModalButton}>{delegationModal}</div>
        </div>
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
              <List aria-labelledby={ariaLabelledBy}>
                {filteredResources.map((resource, index) => {
                  const resourceId =
                    getItemId?.(resource) ?? resource.identifier ?? `resource-${index}`;
                  const resourceName = resource.title;
                  const defaultOwnerName = resource.resourceOwnerName;
                  const description = getDescriptionText?.(resource, index);
                  const ownerLogoUrl = resource.resourceOwnerLogoUrl;
                  const itemInteractive = derivedInteractive(resource);
                  const itemAs = as ?? (itemInteractive ? 'button' : 'div');
                  const itemSize = size ?? 'xs';
                  const handleClick = itemInteractive ? () => handleSelect(resource) : undefined;
                  const itemShadow = itemInteractive ? undefined : 'none';
                  const titleBadge = isExpiredResource(resource)
                    ? { label: t('resource_list.expired_badge'), color: 'neutral' as const }
                    : undefined;

                  const actionControlId = getActionControlId?.(resource);
                  return (
                    <ResourceListItemRow
                      key={resourceId}
                      resourceId={resourceId}
                      actionControlId={actionControlId}
                      id={resourceId}
                      resourceName={resourceName}
                      ownerName={defaultOwnerName}
                      description={description}
                      ownerLogoUrl={ownerLogoUrl}
                      ownerLogoUrlAlt={defaultOwnerName}
                      as={itemAs}
                      size={itemSize}
                      titleAs='div'
                      interactive={itemInteractive}
                      onClick={handleClick}
                      badge={getBadge?.(resource, index)}
                      titleBadge={titleBadge}
                      variant={getHasAccess?.(resource) ? 'tinted' : 'default'}
                      controls={renderControls?.(resource)}
                      loading={false}
                      shadow={itemShadow}
                      border={border}
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
        />
      )}
    </div>
  );
};

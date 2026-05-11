import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';

import { ResourceFilterToolbar } from '@/features/amUI/common/ResourceFilterToolbar/ResourceFilterToolbar';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { getMaskinportenScopeCount } from './scopeUtils';
import classes from './ScopeList.module.css';

interface ScopeListProps {
  resources: ServiceResource[];
  renderControls?: (resource: ServiceResource) => ReactNode;
  search: string;
  setSearch: (value: string) => void;
  filterState: string[];
  setFilterState: (value: string[]) => void;
  serviceOwnerOptions: { value: string; label: string; count?: number }[];
  onSelect?: (resource: ServiceResource) => void;
  getHasAccess?: (resource: ServiceResource) => boolean;
  emptyState?: ReactNode;
  addNewResourceButton?: ReactNode;
  showResultsCount?: boolean;
  totalResultsCount?: number;
}

export const ScopeList = ({
  resources,
  renderControls,
  search,
  setSearch,
  filterState,
  setFilterState,
  serviceOwnerOptions,
  onSelect,
  getHasAccess,
  emptyState,
  addNewResourceButton,
  showResultsCount,
  totalResultsCount,
}: ScopeListProps) => {
  const { t } = useTranslation();
  return (
    <div className={classes.resourceSearchResult}>
      <div className={classes.toolbarContainer}>
        <ResourceFilterToolbar
          search={search}
          setSearch={setSearch}
          filterState={filterState}
          setFilterState={setFilterState}
          serviceOwnerOptions={serviceOwnerOptions}
        />
        {addNewResourceButton && addNewResourceButton}
      </div>
      {resources.length === 0 && emptyState !== undefined ? (
        emptyState
      ) : (
        <>
          {showResultsCount && (
            <DsParagraph data-size='sm'>
              {t('maskinporten_page.search_results_count', {
                count: totalResultsCount ?? resources.length,
              })}
            </DsParagraph>
          )}
          <ResourceList
            resources={resources}
            enableSearch={false}
            showDetails={false}
            onSelect={onSelect}
            size='sm'
            titleAs='span'
            getHasAccess={getHasAccess}
            renderControls={renderControls}
            getDescriptionText={(resource) =>
              t('maskinporten_page.scope_count', { count: getMaskinportenScopeCount(resource) })
            }
          />
        </>
      )}
    </div>
  );
};

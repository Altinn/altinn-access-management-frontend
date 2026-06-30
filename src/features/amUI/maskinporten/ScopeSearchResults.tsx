import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { SkeletonResourceList } from '@/features/amUI/common/ResourceList/SkeletonResourceList';
import type {
  ResourceDelegation,
  ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { ScopeSearchControls } from './ScopeSearchControls';
import { getMaskinportenScopeCount } from './scopeUtils';
import classes from '../common/DelegationModal/SingleRights/ResourceSearch.module.css';

interface ScopeSearchResultsProps {
  isFetching: boolean;
  error: unknown;
  resources?: ServiceResource[];
  searchString?: string;
  delegatedResources?: ResourceDelegation[];
  totalNumberOfResults?: number;
  currentPage: number;
  searchResultsPerPage: number;
  onSelect: (resource: ServiceResource, error?: boolean) => void;
  setCurrentPage: (page: number) => void;
}

export const ScopeSearchResults = ({
  isFetching,
  error,
  resources,
  searchString,
  delegatedResources,
  totalNumberOfResults,
  currentPage,
  searchResultsPerPage,
  onSelect,
  setCurrentPage,
}: ScopeSearchResultsProps) => {
  const { t } = useTranslation();

  const isDelegated = (resourceId: string) =>
    delegatedResources?.some(
      (delegatedResource) => delegatedResource.resource?.identifier === resourceId,
    ) ?? false;

  if (error) {
    return (
      <DsAlert
        role='alert'
        className={classes.searchError}
        data-color='danger'
      >
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('common.general_error_title')}
        </DsHeading>
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <>
      <div className={classes.resultCount}>
        {!isFetching && totalNumberOfResults !== undefined && (
          <DsParagraph>{`${String(totalNumberOfResults)} ${t('single_rights.search_hits')}`}</DsParagraph>
        )}
      </div>
      {isFetching ? (
        <div className={classes.resourceList}>
          <SkeletonResourceList count={searchResultsPerPage} />
        </div>
      ) : (
        <>
          {resources && resources.length > 0 && (
            <div className={classes.resourceList}>
              <ResourceList
                resources={resources}
                enableSearch={false}
                showDetails={false}
                onSelect={onSelect}
                size='sm'
                getHasAccess={(resource) => isDelegated(resource.identifier)}
                renderControls={(resource) => (
                  <ScopeSearchControls
                    resource={resource}
                    hasDelegatedResource={isDelegated(resource.identifier)}
                    isDelegatedResourcesLoading={delegatedResources === undefined}
                    onSelect={onSelect}
                  />
                )}
                getDescriptionText={(resource) =>
                  t('maskinporten_page.scope_count', { count: getMaskinportenScopeCount(resource) })
                }
              />
            </div>
          )}
          {resources && resources.length === 0 && (
            <DsParagraph data-size='md'>
              {searchString
                ? t('resource_list.no_resources_filtered', { searchTerm: searchString })
                : t('maskinporten_page.no_scopes')}
            </DsParagraph>
          )}
        </>
      )}
      {totalNumberOfResults !== undefined && totalNumberOfResults > searchResultsPerPage && (
        <AmPagination
          className={classes.pagination}
          currentPage={currentPage}
          totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
          setCurrentPage={setCurrentPage}
          size='xs'
          hideLabels={true}
        />
      )}
    </>
  );
};

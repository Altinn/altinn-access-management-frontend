import { DsAlert, DsParagraph, DsSpinner, List } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Party } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import type { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import { useAreaPackageList } from './useAreaPackageList';
import { useAccessPackageActions } from './useAccessPackageActions';
import { SkeletonAccessPackageList } from './SkeletonAccessPackageList';
import { AreaItem } from './AreaItem';
import { useAreaExpandedContextOrLocal } from './AccessPackageExpandedContext';
import { AreaItemContent } from './AreaItemContent';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

interface AccessPackageListProps {
  showAllPackages?: boolean;
  showAllAreas?: boolean;
  minimizeAvailablePackages?: boolean;
  isLoading?: boolean;
  availableActions?: DelegationAction[];
  showAvailableToggle?: boolean;
  searchString?: string;
  showPermissions?: boolean;
  showPackagesCount?: boolean;
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegateSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onDelegateError?: (accessPackage: AccessPackage, error: ActionError) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, error: ActionError) => void;
  packageAs?: React.ElementType;
  noPackagesText?: string;
}

export const AccessPackageList = ({
  showAllAreas,
  showAllPackages,
  minimizeAvailablePackages,
  isLoading,
  availableActions,
  showAvailableToggle,
  onSelect,
  onDelegateSuccess,
  onDelegateError,
  onRevokeSuccess,
  onRevokeError,
  searchString,
  showPermissions,
  showPackagesCount,
  packageAs,
  noPackagesText,
}: AccessPackageListProps) => {
  const { t } = useTranslation();

  const {
    loadingPackageAreas,
    fetchingSearch,
    loadingDelegations,
    assignedAreas,
    availableAreas,
    allPackageAreas,
    searchError,
    activeDelegationsError,
  } = useAreaPackageList({
    showAllAreas,
    showAllPackages,
    searchString,
  });

  const {
    onDelegate,
    onRevoke,
    onRequest,
    isLoading: isActionLoading,
  } = useAccessPackageActions({
    onDelegateSuccess,
    onDelegateError,
    onRevokeSuccess,
    onRevokeError,
  });

  const combinedAreas = [...assignedAreas, ...availableAreas];
  const { toggleExpandedArea, isExpanded } = useAreaExpandedContextOrLocal();

  if (loadingDelegations || loadingPackageAreas || isLoading) {
    return (
      <div className={classes.accessAreaList}>
        <SkeletonAccessPackageList />
      </div>
    );
  }

  if (fetchingSearch && searchString && searchString.length > 0) {
    return (
      <div className={classes.accessAreaList}>
        <DsSpinner
          aria-label={t('common.loading')}
          className={classes.noAccessPackages}
        />
      </div>
    );
  }

  if (searchError || activeDelegationsError) {
    const detail = createErrorDetails(searchError || activeDelegationsError);
    return (
      <div>
        <DsAlert
          data-color='danger'
          data-size='sm'
        >
          <TechnicalErrorParagraphs
            status={detail?.status || '500'}
            time={new Date().toISOString()}
            traceId={detail?.traceId}
          />
        </DsAlert>
      </div>
    );
  }

  const displayAreas = searchString
    ? combinedAreas
    : [...combinedAreas].sort((a, b) => a.name.localeCompare(b.name));

  if (
    searchString &&
    searchString.length > 0 &&
    (allPackageAreas === undefined ||
      allPackageAreas.length === 0 ||
      (!showAllAreas && displayAreas.length === 0))
  ) {
    return (
      <div className={classes.accessAreaList}>
        <DsParagraph className={classes.noAccessPackages}>
          {t('access_packages.no_matching_search')}
        </DsParagraph>
      </div>
    );
  }

  return (
    <div className={classes.accessAreaList}>
      {displayAreas.length === 0 && !searchError && !activeDelegationsError ? (
        <DsParagraph className={classes.noAccessPackages}>
          {noPackagesText || t('access_packages.no_packages')}
        </DsParagraph>
      ) : (
        <List>
          {displayAreas.map((area) => {
            const expanded = (searchString && searchString.length > 2) || isExpanded(area.id);

            return (
              <AreaItem
                key={area.id}
                area={area}
                expanded={expanded}
                toggleExpandedArea={toggleExpandedArea}
                showPackagesCount={showPackagesCount}
                showPermissions={showPermissions}
              >
                <AreaItemContent
                  area={area}
                  availableActions={availableActions}
                  onSelect={onSelect}
                  onDelegate={onDelegate}
                  onRevoke={onRevoke}
                  onRequest={onRequest}
                  isActionLoading={isActionLoading}
                  showAvailablePackages={!minimizeAvailablePackages}
                  showAvailableToggle={showAvailableToggle}
                  showPermissions={showPermissions}
                  packageAs={packageAs}
                />
              </AreaItem>
            );
          })}
        </List>
      )}
    </div>
  );
};

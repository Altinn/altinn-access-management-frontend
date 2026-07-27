import { DsAlert, DsHeading, DsParagraph, DsSpinner, List } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Party } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import type { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import { ExtendedAccessArea, useAreaPackageList } from './useAreaPackageList';
import { useAccessPackageActions } from './useAccessPackageActions';
import { SkeletonAccessPackageList } from './SkeletonAccessPackageList';
import { AreaItem } from './AreaItem';
import { useAreaExpandedContextOrLocal } from './AccessPackageExpandedContext';
import { AreaItemContent, areaContentId } from './AreaItemContent';
import { packageActionControlId } from './PackageItem';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useRestoreFocusOnDataChange } from '../RestoreFocus';

interface AccessPackageListProps {
  showAllPackages?: boolean;
  showAllAreas?: boolean;
  showOnlyGuardianships?: boolean;
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
  filterByType?: boolean;
  areaHeadingLevel?: 2 | 3;
  showUnassignedAvailableAreas?: boolean;
}

export const AccessPackageList = ({
  showAllAreas,
  showAllPackages,
  showOnlyGuardianships,
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
  filterByType = true,
  areaHeadingLevel = 3,
  showUnassignedAvailableAreas = false,
}: AccessPackageListProps) => {
  const { t } = useTranslation();

  const {
    loadingPackageAreas,
    fetchingSearch,
    loadingDelegations,
    fetchingDelegations,
    assignedAreas,
    availableAreas,
    allPackageAreas,
    activeDelegations,
    searchError,
    activeDelegationsError,
  } = useAreaPackageList({
    showAllAreas,
    showAllPackages,
    showOnlyGuardianships,
    searchString,
    filterByType,
  });

  const requestFocusOnDataChange = useRestoreFocusOnDataChange(activeDelegations);

  const {
    onDelegate,
    onRevoke,
    onRequest,
    deleteRequest,
    hasPendingRequest,
    isLoadingRequest,
    isLoading: isActionLoading,
  } = useAccessPackageActions({
    snackbarBusy: fetchingDelegations,
    onDelegateSuccess: (accessPackage, toParty) => {
      requestFocusOnDataChange(packageActionControlId(accessPackage.id));
      onDelegateSuccess?.(accessPackage, toParty);
    },
    onDelegateError,
    onRevokeSuccess: (accessPackage, toParty) => {
      requestFocusOnDataChange(
        packageActionControlId(accessPackage.id),
        areaContentId(accessPackage.area.id),
      );
      onRevokeSuccess?.(accessPackage, toParty);
    },
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
      <div className={classes.loadingSpinner}>
        <DsSpinner aria-label={t('common.loading')} />
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

  const areasWithActiveMatches = combinedAreas.filter((x) => x.packages.assigned.length > 0);
  const areasWithoutActiveMatches = combinedAreas.filter((x) => x.packages.assigned.length === 0);

  const renderAccessPackageList = (items: ExtendedAccessArea[]) => {
    return (
      <List>
        {items.map((area) => {
          const areaPartyType =
            area.typeName === 'Person' ? PartyType.Person : PartyType.Organization;

          const expanded = (searchString && searchString.length > 2) || isExpanded(area.id);
          return (
            <AreaItem
              key={area.id}
              area={area}
              expanded={expanded}
              toggleExpandedArea={toggleExpandedArea}
              showPackagesCount={showPackagesCount}
              showPermissions={showPermissions}
              partyType={areaPartyType}
              headingLevel={areaHeadingLevel}
            >
              <AreaItemContent
                area={area}
                availableActions={availableActions}
                onSelect={onSelect}
                onDelegate={onDelegate}
                onRevoke={onRevoke}
                onRequest={onRequest}
                onDeleteRequest={deleteRequest}
                hasPendingRequest={hasPendingRequest}
                isLoadingRequest={isLoadingRequest}
                isActionLoading={isActionLoading}
                showAvailablePackages={!minimizeAvailablePackages}
                showAvailableToggle={showAvailableToggle}
                showPermissions={showPermissions}
                packageAs={packageAs}
                partyType={areaPartyType}
                headingLevel={areaHeadingLevel === 2 ? 3 : 4}
              />
            </AreaItem>
          );
        })}
      </List>
    );
  };

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

  if (displayAreas.length === 0 && !searchError && !activeDelegationsError) {
    return (
      <div className={classes.accessAreaList}>
        <DsParagraph className={classes.noAccessPackages}>
          {noPackagesText || t('access_packages.no_packages')}
        </DsParagraph>
      </div>
    );
  }

  return (
    <div className={classes.accessAreaList}>
      {showUnassignedAvailableAreas ? (
        <>
          <DsHeading
            level={2}
            data-size='xs'
            className={classes.subListHeading}
          >
            {t('access_packages.search_active_matches')}:
          </DsHeading>
          {areasWithActiveMatches.length === 0 ? (
            <DsParagraph className={classes.noAccessPackages}>
              {t('access_packages.search_no_active_matches')}
            </DsParagraph>
          ) : (
            renderAccessPackageList(areasWithActiveMatches)
          )}
          {areasWithoutActiveMatches.length > 0 && (
            <>
              <hr className={classes.otherListDivider} />
              <DsHeading
                level={2}
                data-size='xs'
                className={classes.subListHeading}
              >
                {t('access_packages.search_other_matches')}:
              </DsHeading>
              {renderAccessPackageList(areasWithoutActiveMatches)}
            </>
          )}
        </>
      ) : (
        <>{renderAccessPackageList(displayAreas)}</>
      )}
    </div>
  );
};

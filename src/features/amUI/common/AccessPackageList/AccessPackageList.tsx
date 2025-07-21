import { DsParagraph, DsSpinner, ListBase } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Party } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import type { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import { useAreaPackageList } from './useAreaPackageList';
import { AreaItem } from './AreaItem';
import { useAccessPackageActions } from './useAccessPackageActions';
import { SkeletonAccessPackageList } from './SkeletonAccessPackageList';
import { AreaItemContent } from './AreaItemContent';
import { useAreaExpandedContextOrLocal } from './AccessPackageExpandedContext';

interface AccessPackageListProps {
  showAllPackages?: boolean;
  showAllAreas?: boolean;
  minimizeAvailablePackages?: boolean;
  isLoading?: boolean;
  availableActions?: DelegationAction[];
  searchString?: string;
  useDeleteConfirm?: boolean;
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegateSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onDelegateError?: (accessPackage: AccessPackage, error: ActionError) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, error: ActionError) => void;
}

export const AccessPackageList = ({
  showAllAreas,
  showAllPackages,
  minimizeAvailablePackages,
  isLoading,
  availableActions,
  onSelect,
  useDeleteConfirm,
  onDelegateSuccess,
  onDelegateError,
  onRevokeSuccess,
  onRevokeError,
  searchString,
}: AccessPackageListProps) => {
  const { t } = useTranslation();

  const { toggleExpandedArea, isExpanded } = useAreaExpandedContextOrLocal();

  const {
    loadingPackageAreas,
    fetchingSearch,
    loadingDelegations,
    assignedAreas,
    availableAreas,
    allPackageAreas,
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

  const displayAreas = searchString
    ? combinedAreas
    : combinedAreas.sort((a, b) => a.name.localeCompare(b.name));

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

  if (
    searchString &&
    searchString?.length > 0 &&
    (allPackageAreas === undefined || allPackageAreas.length === 0)
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
      {displayAreas.length === 0 ? (
        <DsParagraph className={classes.noAccessPackages}>
          {t('access_packages.user_has_no_packages')}
        </DsParagraph>
      ) : (
        <ListBase>
          {displayAreas.map((area) => {
            const expanded = (searchString && searchString.length > 2) || isExpanded(area.id);

            return (
              <AreaItem
                key={area.id}
                area={area}
                expanded={expanded}
                toggleExpandedArea={toggleExpandedArea}
                showBadge={showAllPackages}
              >
                <AreaItemContent
                  area={area}
                  availableActions={availableActions}
                  onSelect={onSelect}
                  onDelegate={onDelegate}
                  onRevoke={onRevoke}
                  onRequest={onRequest}
                  isActionLoading={isActionLoading}
                  useDeleteConfirm={useDeleteConfirm}
                  showAvailablePackages={!minimizeAvailablePackages}
                />
              </AreaItem>
            );
          })}
        </ListBase>
      )}
    </div>
  );
};

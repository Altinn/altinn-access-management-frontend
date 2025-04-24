import { ListBase } from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetUserDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import type { DelegationAction } from '../DelegationModal/EditModal';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

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
  const { data: allPackageAreas, isLoading: loadingPackageAreas } = useSearchQuery(
    searchString ?? '',
  );
  const { fromParty, toParty } = usePartyRepresentation();
  const { data: activeDelegations, isLoading: loadingDelegations } = useGetUserDelegationsQuery({
    from: fromParty?.partyUuid ?? '',
    to: toParty?.partyUuid ?? '',
  });

  const { toggleExpandedArea, isExpanded } = useAreaExpandedContextOrLocal();

  const { assignedAreas, availableAreas } = useAreaPackageList({
    allPackageAreas,
    activeDelegations,
    showAllAreas,
    showAllPackages,
  });

  const { onDelegate, onRevoke, onRequest } = useAccessPackageActions({
    toUuid: toParty?.partyUuid || '',
    onDelegateSuccess,
    onDelegateError,
    onRevokeSuccess,
    onRevokeError,
  });

  const combinedAreas = [...assignedAreas, ...availableAreas];

  const displayAreas = searchString
    ? combinedAreas
    : combinedAreas.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={classes.accessAreaList}>
      {loadingDelegations || loadingPackageAreas || isLoading ? (
        <SkeletonAccessPackageList />
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

import { ListBase } from '@altinn/altinn-components';
import { useState } from 'react';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetUserDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import type { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import { useAreaPackageList } from './useAreaPackageList';
import { AreaItem } from './AreaItem';
import { useAccessPackageActions } from './useAccessPackageActions';
import { SkeletonAccessPackageList } from './SkeletonAccessPackageList';
import { AreaItemContent } from './AreaItemContent';

interface AccessPackageListProps {
  showAllPackages?: boolean;
  fromPartyUuid: string;
  toPartyUuid: string;
  showAllAreas?: boolean;
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
  isLoading,
  availableActions,
  onSelect,
  useDeleteConfirm,
  onDelegateSuccess,
  onDelegateError,
  onRevokeSuccess,
  onRevokeError,
  searchString,
  fromPartyUuid,
  toPartyUuid,
}: AccessPackageListProps) => {
  const { data: allPackageAreas, isLoading: loadingPackageAreas } = useSearchQuery(
    searchString ?? '',
  );
  const { data: activeDelegations, isLoading: loadingDelegations } = useGetUserDelegationsQuery({
    from: fromPartyUuid,
    to: toPartyUuid,
  });

  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);

  const toggleExpandedArea = (areaId: string) => {
    if (expandedAreas.some((id) => id === areaId)) {
      const newExpandedState = expandedAreas.filter((id) => id !== areaId);
      setExpandedAreas(newExpandedState);
    } else {
      setExpandedAreas([...expandedAreas, areaId]);
    }
  };

  const { assignedAreas, availableAreas } = useAreaPackageList({
    allPackageAreas,
    activeDelegations,
    showAllAreas,
    showAllPackages,
  });

  const { onDelegate, onRevoke, onRequest } = useAccessPackageActions({
    toUuid: toPartyUuid,
    onDelegateSuccess,
    onDelegateError,
    onRevokeSuccess,
    onRevokeError,
  });

  const sortedAreas = [...assignedAreas, ...availableAreas].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className={classes.accessAreaList}>
      {loadingDelegations || loadingPackageAreas || isLoading ? (
        <SkeletonAccessPackageList />
      ) : (
        <ListBase>
          {sortedAreas.map((area) => {
            const expanded = expandedAreas.some((areaId) => areaId === area.id);

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
                />
              </AreaItem>
            );
          })}
        </ListBase>
      )}
    </div>
  );
};

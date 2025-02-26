import { ListBase, Button } from '@altinn/altinn-components';
import { useState } from 'react';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { Paragraph } from '@digdir/designsystemet-react';

import type { Party } from '@/rtk/features/lookupApi';
import { useGetUserDelegationsQuery, useSearchQuery } from '@/rtk/features/accessPackageApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { ButtonWithConfirmPopup } from '../ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import { useAreaPackageList } from './useAreaPackageList';
import { AreaItem } from './AreaItem';
import { PackageItem } from './PackageItem';
import { useAccessPackageActions } from './useAccessPackageActions';
import { SkeletonAccessPackageList } from './SkeletonAccessPackageList';

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
  onDelegateError?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeSuccess?: (accessPackage: AccessPackage, toParty: Party) => void;
  onRevokeError?: (accessPackage: AccessPackage, toParty: Party) => void;
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
  const { t } = useTranslation();

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
            const { packages } = area;
            const expanded = expandedAreas.some((areaId) => areaId === area.id);

            return (
              <AreaItem
                key={area.id}
                area={area}
                expanded={expanded}
                toggleExpandedArea={toggleExpandedArea}
                showBadge={showAllPackages}
              >
                <div className={classes.accessAreaContent}>
                  <Paragraph>{area.description}</Paragraph>
                  {packages.assigned.length > 0 && (
                    <ListBase>
                      {packages.assigned.map((pkg) => (
                        <PackageItem
                          key={pkg.id}
                          pkg={pkg}
                          onSelect={onSelect}
                          hasAccess
                          controls={
                            availableActions?.includes(DelegationAction.REVOKE) &&
                            useDeleteConfirm ? (
                              <ButtonWithConfirmPopup
                                triggerButtonContent={t('common.delete_poa')}
                                triggerButtonProps={{
                                  icon: MinusCircleIcon,
                                  variant: 'text',
                                  size: 'sm',
                                  disabled: pkg.inherited,
                                }}
                                message={t('user_rights_page.delete_confirm_message', {
                                  name: pkg.name,
                                })}
                                size='sm'
                                onConfirm={() => onRevoke(pkg)}
                              />
                            ) : (
                              <Button
                                icon={MinusCircleIcon}
                                variant='text'
                                size='sm'
                                disabled={pkg.inherited}
                                onClick={() => onRevoke(pkg)}
                              >
                                {t('common.delete_poa')}
                              </Button>
                            )
                          }
                        />
                      ))}
                    </ListBase>
                  )}
                  {packages.available.length > 0 && (
                    <ListBase>
                      {packages.available.map((pkg) => (
                        <PackageItem
                          key={pkg.id}
                          pkg={pkg}
                          onSelect={onSelect}
                          controls={
                            <>
                              {availableActions?.includes(DelegationAction.DELEGATE) && (
                                <Button
                                  icon={PlusCircleIcon}
                                  variant='text'
                                  size='sm'
                                  onClick={() => onDelegate(pkg)}
                                >
                                  {t('common.give_poa')}
                                </Button>
                              )}
                              {availableActions?.includes(DelegationAction.REQUEST) && (
                                <Button
                                  icon={PlusCircleIcon}
                                  variant='text'
                                  size='sm'
                                  disabled
                                  onClick={() => onRequest(pkg)}
                                >
                                  {t('common.request_poa')}
                                </Button>
                              )}
                            </>
                          }
                        />
                      ))}
                    </ListBase>
                  )}
                </div>
              </AreaItem>
            );
          })}
        </ListBase>
      )}
    </div>
  );
};

import { Paragraph } from '@digdir/designsystemet-react';
import { Button, ListBase } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';

import { useDelegationCheckMutation, type AccessPackage } from '@/rtk/features/accessPackageApi';

import { ButtonWithConfirmPopup } from '../ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import type { ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';

interface AreaItemContentProps {
  area: ExtendedAccessArea;
  availableActions?: DelegationAction[];
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegate: (accessPackage: AccessPackage) => void;
  onRevoke: (accessPackage: AccessPackage) => void;
  onRequest: (accessPackage: AccessPackage) => void;
  useDeleteConfirm?: boolean;
}

export const AreaItemContent = ({
  area,
  availableActions,
  onSelect,
  onDelegate,
  onRevoke,
  onRequest,
  useDeleteConfirm,
}: AreaItemContentProps) => {
  const { packages } = area;
  const { t } = useTranslation();

  const availablePackageIds = useMemo(
    () => packages.available.map((pkg) => pkg.id),
    [packages.available],
  );

  const canDelegate = useDelegationCheck(availablePackageIds);

  return (
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
                availableActions?.includes(DelegationAction.REVOKE) && useDeleteConfirm ? (
                  <ButtonWithConfirmPopup
                    triggerButtonContent={t('common.delete_poa')}
                    triggerButtonProps={{
                      icon: MinusCircleIcon,
                      variant: 'text',
                      size: 'sm',
                      disabled: pkg.inherited,
                    }}
                    popoverProps={{
                      color: 'neutral',
                    }}
                    message={t('user_rights_page.delete_confirm_message', {
                      name: pkg.name,
                    })}
                    data-size='sm'
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
                      disabled={canDelegate(pkg.id)}
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
  );
};

const useDelegationCheck = (accessPackageIds: string[]) => {
  const [delegationCheck, { isLoading, data }] = useDelegationCheckMutation();

  useEffect(() => {
    if (accessPackageIds.length > 0) {
      delegationCheck({ packageIds: accessPackageIds });
    }
  }, [accessPackageIds]);

  const canDelegate = (id: string) =>
    !isLoading && data?.find((d) => d.packageId === id)?.canDelegate;

  return canDelegate;
};

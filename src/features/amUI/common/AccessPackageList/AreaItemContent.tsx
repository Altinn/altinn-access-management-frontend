import { List, DsParagraph, DsButton, DsSpinner } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import cn from 'classnames';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import { DeletableStatus, type ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';
import { RevokeAccessPackageActionControl } from './RevokeAccessPackageActionControl';
import { DelegateAccessPackageActionControl } from './DelegateAccessPackageActionControl';
import { PermissionBadge } from './PermissionBadge';
import { isCriticalAndUndelegated, UndelegatedPackageWarning } from './UndelegatedPackageWarning';
import { useAccessPackageDelegationCheck } from '../DelegationCheck/AccessPackageDelegationCheckContext';

interface AreaItemContentProps {
  area: ExtendedAccessArea;
  availableActions?: DelegationAction[];
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegate?: (accessPackage: AccessPackage) => void;
  onRevoke?: (accessPackage: AccessPackage) => void;
  onRequest?: (accessPackage: AccessPackage) => void;
  isActionLoading?: boolean;
  showAvailablePackages?: boolean;
  showAvailableToggle?: boolean;
  showPermissions?: boolean;
  packageAs?: React.ElementType;
}

export const AreaItemContent = ({
  area,
  availableActions,
  onSelect,
  onDelegate,
  onRevoke,
  onRequest,
  isActionLoading = false,
  showAvailablePackages: showAvailablePackagesExternal = false,
  showAvailableToggle = true,
  showPermissions = false,
  packageAs,
}: AreaItemContentProps) => {
  const { packages } = area;
  const { t } = useTranslation();
  const [showAvailablePackages, setShowAvailablePackages] = useState(
    showAvailablePackagesExternal ?? false,
  );

  const isSm = useIsMobileOrSmaller();

  const { canDelegatePackage } = useAccessPackageDelegationCheck();

  const revokeActionControl = (pkg: AccessPackage) => {
    if (isActionLoading) {
      return (
        <DsSpinner
          aria-label={t('common.loading')}
          data-size='xs'
        />
      );
    }
    return (
      <RevokeAccessPackageActionControl
        availableActions={availableActions}
        onRevoke={() => onRevoke?.(pkg)}
        pkg={pkg}
        isLoading={isActionLoading}
      />
    );
  };

  return (
    <div className={cn(classes.accessAreaContent, !isSm && classes.accessAreaContentMargin)}>
      <DsParagraph>{area.description}</DsParagraph>
      {packages.assigned.length > 0 && (
        <List aria-label={t('access_packages.given_packages_title')}>
          {packages.assigned.map((pkg) => {
            const Component = packageAs || 'button';
            return (
              <PackageItem
                as={(props) => (
                  <Component
                    packageId={pkg.id}
                    {...props}
                  />
                )}
                key={pkg.id}
                pkg={pkg}
                onSelect={onSelect}
                hasAccess
                controls={
                  !isSm &&
                  pkg.deletableStatus !== DeletableStatus.NotDeletable &&
                  !pkg.inherited &&
                  revokeActionControl(pkg)
                }
                badge={
                  <>
                    {showPermissions && pkg.permissions && (
                      <PermissionBadge permissions={pkg.permissions} />
                    )}
                  </>
                }
              />
            );
          })}
        </List>
      )}

      {showAvailableToggle && !showAvailablePackagesExternal && (
        <DsButton
          variant='tertiary'
          onClick={() => setShowAvailablePackages((prev) => !prev)}
          className={classes.showAvailablePackagesButton}
          data-size='sm'
        >
          {t('access_packages.other_available')} {`(${packages.available.length})`}{' '}
          {showAvailablePackages ? (
            <ChevronUpIcon aria-label={t('common.close')} />
          ) : (
            <ChevronDownIcon aria-label={t('common.open')} />
          )}
        </DsButton>
      )}

      {packages.available.length > 0 && showAvailablePackages && (
        <List aria-label={t('access_packages.available_packages_title')}>
          {packages.available.map((pkg) => {
            const canDelegate = canDelegatePackage(pkg.id);
            const Component = packageAs || 'button';
            return (
              <PackageItem
                as={(props) => (
                  <Component
                    packageId={pkg.id}
                    {...props}
                  />
                )}
                key={pkg.id}
                pkg={pkg}
                onSelect={onSelect}
                badge={
                  <>
                    {showPermissions && isCriticalAndUndelegated(pkg) && (
                      <UndelegatedPackageWarning />
                    )}
                  </>
                }
                controls={
                  !isSm && (
                    <DelegateAccessPackageActionControl
                      isLoading={isActionLoading}
                      availableActions={availableActions}
                      disabled={pkg.isAssignable === false}
                      accessPackageName={pkg.name}
                      canDelegate={canDelegate?.result ?? true /* allow attempt if unknown */}
                      onDelegate={() => onDelegate?.(pkg)}
                      onRequest={() => onRequest?.(pkg)}
                    />
                  )
                }
              />
            );
          })}
        </List>
      )}
    </div>
  );
};

import {
  List,
  DsAlert,
  DsHeading,
  DsParagraph,
  DsButton,
  DsSpinner,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import cn from 'classnames';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { DelegationAction } from '../DelegationModal/EditModal';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';

import classes from './AccessPackageList.module.css';
import { DeletableStatus, type ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';
import { RevokeAccessPackageActionControl } from './RevokeAccessPackageActionControl';
import { DelegateAccessPackageActionControl } from './DelegateAccessPackageActionControl';
import { PermissionBadge } from './PermissionBadge';

interface AreaItemContentProps {
  area: ExtendedAccessArea;
  availableActions?: DelegationAction[];
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegate?: (accessPackage: AccessPackage) => void;
  onRevoke?: (accessPackage: AccessPackage) => void;
  onRequest?: (accessPackage: AccessPackage) => void;
  isActionLoading?: boolean;
  showAvailablePackages?: boolean;
  useDeleteConfirm?: boolean;
  enableActions?: boolean;
  enableDelegationCheck?: boolean;
  showAvailableToggle?: boolean;
  showPermissions?: boolean;
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
  useDeleteConfirm,
  enableActions = true,
  enableDelegationCheck = true,
  showAvailableToggle = true,
  showPermissions = false,
}: AreaItemContentProps) => {
  const { packages } = area;
  const { t } = useTranslation();
  const [showAvailablePackages, setShowAvailablePackages] = useState(
    showAvailablePackagesExternal ?? false,
  );
  const [delegationCheckError, setDelegationCheckError] = useState<ActionError | null>(null);
  const availablePackageIds = useMemo(
    () => packages.available.map((pkg) => pkg.id),
    [packages.available],
  );
  const handleDelegationCheckFailure = (error: ActionError) => {
    setDelegationCheckError(error);
  };
  const { displayLimitedPreviewLaunch } = window.featureFlags;
  const shouldShowDelegationCheck =
    enableDelegationCheck &&
    !!availableActions?.includes(DelegationAction.DELEGATE) &&
    !displayLimitedPreviewLaunch;
  const { canDelegate, isUninitialized, isLoading } = useAccessPackageDelegationCheck(
    availablePackageIds,
    shouldShowDelegationCheck && showAvailablePackages,
    handleDelegationCheckFailure,
  );
  const isSm = useIsMobileOrSmaller();

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
        useDeleteConfirm={useDeleteConfirm}
        isLoading={isActionLoading}
      />
    );
  };

  return (
    <div className={cn(classes.accessAreaContent, !isSm && classes.accessAreaContentMargin)}>
      <DsParagraph>{area.description}</DsParagraph>
      {packages.assigned.length > 0 && (
        <List aria-label={t('access_packages.given_packages_title')}>
          {packages.assigned.map((pkg) => (
            <PackageItem
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              hasAccess
              controls={
                enableActions &&
                !isSm &&
                pkg.deletableStatus !== DeletableStatus.NotDeletable &&
                revokeActionControl(pkg)
              }
              badge={showPermissions && <PermissionBadge permissions={pkg.permissions} />}
            />
          ))}
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
      {showAvailablePackages && delegationCheckError && (
        <DsAlert data-color='danger'>
          <DsHeading level={3}>
            {t('access_packages.delegation_check.delegation_check_error_heading')}
          </DsHeading>
          <TechnicalErrorParagraphs
            message={t('access_packages.delegation_check.delegation_check_error_message_plural', {
              count: 2,
            })}
            status={delegationCheckError.httpStatus}
            time={delegationCheckError.timestamp}
          />
        </DsAlert>
      )}
      {packages.available.length > 0 && showAvailablePackages && (
        <List aria-label={t('access_packages.available_packages_title')}>
          {packages.available.map((pkg) => {
            return (
              <PackageItem
                key={pkg.id}
                pkg={pkg}
                onSelect={onSelect}
                controls={
                  enableActions &&
                  !isSm && (
                    <DelegateAccessPackageActionControl
                      isLoading={(isUninitialized && shouldShowDelegationCheck) || isActionLoading}
                      availableActions={availableActions}
                      disabled={pkg.isAssignable === false}
                      canDelegate={
                        !shouldShowDelegationCheck || isLoading ? true : !!canDelegate(pkg.id)
                      } // Default to true to avoid blips in UI
                      onDelegate={() => onDelegate?.(pkg)}
                      onRequest={() => onRequest?.(pkg)}
                      onSelect={() => onSelect?.(pkg)}
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

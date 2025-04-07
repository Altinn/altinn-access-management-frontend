import { Alert, Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { ListBase } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import cn from 'classnames';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';
import type { ActionError } from '@/resources/hooks/useActionError';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { DelegationAction } from '../DelegationModal/EditModal';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';

import classes from './AccessPackageList.module.css';
import type { ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';
import { RevokeAccessPackageActionControl } from './RevokeAccessPackageActionControl';
import { DelegateAccessPackageActionControl } from './DelegateAccessPackageActionControl';

interface AreaItemContentProps {
  area: ExtendedAccessArea;
  availableActions?: DelegationAction[];
  onSelect?: (accessPackage: AccessPackage) => void;
  onDelegate: (accessPackage: AccessPackage) => void;
  onRevoke: (accessPackage: AccessPackage) => void;
  onRequest: (accessPackage: AccessPackage) => void;
  showAvailablePackages?: boolean;
  useDeleteConfirm?: boolean;
}

export const AreaItemContent = ({
  area,
  availableActions,
  onSelect,
  onDelegate,
  onRevoke,
  onRequest,
  showAvailablePackages: showAvailablePackagesExternal = false,
  useDeleteConfirm,
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
  const shouldShowDelegationCheck = !!availableActions?.includes(DelegationAction.DELEGATE);
  const { canDelegate, isLoading, isUninitialized } = useAccessPackageDelegationCheck(
    availablePackageIds,
    shouldShowDelegationCheck && showAvailablePackages,
    handleDelegationCheckFailure,
  );
  const isSm = useIsMobileOrSmaller();
  return (
    <div className={cn(classes.accessAreaContent, !isSm && classes.accessAreaContentMargin)}>
      <Paragraph>{area.description}</Paragraph>
      {packages.assigned.length > 0 && (
        <ListBase aria-label={t('access_packages.given_packages_title')}>
          {packages.assigned.map((pkg) => (
            <PackageItem
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              hasAccess
              controls={
                !isSm && (
                  <RevokeAccessPackageActionControl
                    availableActions={availableActions}
                    onRevoke={() => onRevoke(pkg)}
                    pkg={pkg}
                    useDeleteConfirm={useDeleteConfirm}
                  />
                )
              }
            />
          ))}
        </ListBase>
      )}

      {!showAvailablePackagesExternal && (
        <Button
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
        </Button>
      )}
      {showAvailablePackages && delegationCheckError && (
        <Alert data-color='danger'>
          <Heading level={3}>
            {t('access_packages.delegation_check.delegation_check_error_heading')}
          </Heading>
          <TechnicalErrorParagraphs
            message={t('access_packages.delegation_check.delegation_check_error_message_plural', {
              count: 2,
            })}
            status={delegationCheckError.httpStatus}
            time={delegationCheckError.timestamp}
          />
        </Alert>
      )}
      {packages.available.length > 0 && showAvailablePackages && (
        <ListBase aria-label={t('access_packages.available_packages_title')}>
          {packages.available.map((pkg) => (
            <PackageItem
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              controls={
                !isSm && (
                  <DelegateAccessPackageActionControl
                    isLoading={(isLoading || isUninitialized) && shouldShowDelegationCheck}
                    availableActions={availableActions}
                    canDelegate={!!canDelegate(pkg.id)}
                    onDelegate={() => onDelegate(pkg)}
                    onRequest={() => onRequest(pkg)}
                    onSelect={() => onSelect?.(pkg)}
                  />
                )
              }
            />
          ))}
        </ListBase>
      )}
    </div>
  );
};

import { Alert, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { ListBase } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AccessPackageList.module.css';
import type { ExtendedAccessArea } from './useAreaPackageList';
import { PackageItem } from './PackageItem';
import { useAccessPackageDelegationCheck } from '@/resources/hooks/useAccessPackageDelegationCheck';
import { ActionError } from '@/resources/hooks/useActionError';
import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import cn from 'classnames';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { RevokeAccessPackageActionControl } from './RevokeAccessPackageActionControl';
import { DelegateAccessPackageActionControl } from './DelegateAccessPackageActionControl';

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
  const [delegationCheckError, setDelegationCheckError] = useState<ActionError | null>(null);
  const availablePackageIds = useMemo(
    () => packages.available.map((pkg) => pkg.id),
    [packages.available],
  );
  const handleDelegationCheckFailure = (error: ActionError) => {
    setDelegationCheckError(error);
  };
  const shouldShowDelegationCheck = !!availableActions?.includes(DelegationAction.DELEGATE);
  const { canDelegate, isLoading } = useAccessPackageDelegationCheck(
    availablePackageIds,
    shouldShowDelegationCheck,
    handleDelegationCheckFailure,
  );
  const isSm = useIsMobileOrSmaller();
  return (
    <div className={cn(classes.accessAreaContent, !isSm && classes.accessAreaContentMargin)}>
      <Paragraph>{area.description}</Paragraph>
      {delegationCheckError && (
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
      {packages.assigned.length > 0 && (
        <ListBase>
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
      {packages.available.length > 0 && (
        <ListBase>
          {packages.available.map((pkg) => (
            <PackageItem
              key={pkg.id}
              pkg={pkg}
              onSelect={onSelect}
              controls={
                !isSm && (
                  <DelegateAccessPackageActionControl
                    isLoading={isLoading}
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

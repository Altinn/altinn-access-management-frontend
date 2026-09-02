import { Button, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { DelegationAction } from '../DelegationModal/EditModal';

import { DeletableStatus, type ExtendedAccessPackage } from './useAreaPackageList';
import { PackageIsPartiallyDeletableAlert } from './PackageIsPartiallyDeletableAlert/PackageIsPartiallyDeletableAlert';
import { packageActionControlId } from './PackageItem';
import type { RevokeOptions } from './useAccessPackageActions';

interface RevokeAccessPackageActionControlsProps {
  availableActions?: DelegationAction[];
  onRevoke: (options?: RevokeOptions) => void;
  pkg: ExtendedAccessPackage;
  isLoading?: boolean;
}

export const RevokeAccessPackageActionControl = ({
  availableActions,
  onRevoke,
  pkg,
  isLoading = false,
}: RevokeAccessPackageActionControlsProps) => {
  const { t } = useTranslation();
  if (availableActions?.includes(DelegationAction.REVOKE)) {
    if (pkg.deletableStatus === DeletableStatus.PartiallyDeletable) {
      return (
        <PackageIsPartiallyDeletableAlert
          confirmAction={() => onRevoke({ skipWarning: true })}
          triggerButtonProps={{
            id: packageActionControlId(pkg.id),
            'data-size': 'sm',
            variant: 'tertiary',
          }}
        />
      );
    }
    return (
      <Button
        id={packageActionControlId(pkg.id)}
        variant='tertiary'
        size='sm'
        onClick={() => onRevoke()}
        aria-label={t('common.delete_poa_for', { poa_object: pkg.name })}
      >
        {isLoading ? (
          <DsSpinner
            aria-label={t('common.loading')}
            data-size='sm'
          />
        ) : (
          <>
            <MinusCircleIcon aria-hidden='true' />
            {t('common.delete_poa')}
          </>
        )}
      </Button>
    );
  }
  return null;
};

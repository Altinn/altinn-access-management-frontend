import { Button, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { DelegationAction } from '../DelegationModal/EditModal';

import { DeletableStatus, type ExtendedAccessPackage } from './useAreaPackageList';
import { PackageIsPartiallyDeletableAlert } from './PackageIsPartiallyDeletableAlert/PackageIsPartiallyDeletableAlert';

interface RevokeAccessPackageActionControlsProps {
  availableActions?: DelegationAction[];
  onRevoke: () => void;
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
          confirmAction={onRevoke}
          triggerButtonProps={{
            'data-size': 'sm',
            variant: 'tertiary',
          }}
        />
      );
    }
    return (
      <Button
        variant='tertiary'
        size='sm'
        onClick={onRevoke}
        aria-label={t('common.delete_poa_for', { poa_object: pkg.name })}
      >
        {isLoading ? (
          <DsSpinner
            aria-label={t('common.loading')}
            data-size='sm'
          />
        ) : (
          <>
            <MinusCircleIcon />
            {t('common.delete_poa')}
          </>
        )}
      </Button>
    );
  }
  return null;
};

import { Button, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { ButtonWithConfirmPopup } from '../ButtonWithConfirmPopup/ButtonWithConfirmPopup';
import { DelegationAction } from '../DelegationModal/EditModal';

import { DeletableStatus, type ExtendedAccessPackage } from './useAreaPackageList';
import { PackageIsPartiallyDeletableAlert } from './PackageIsPartiallyDeletableAlert/PackageIsPartiallyDeletableAlert';

interface RevokeAccessPackageActionControlsProps {
  availableActions?: DelegationAction[];
  onRevoke: () => void;
  pkg: ExtendedAccessPackage;
  useDeleteConfirm?: boolean;
  isLoading?: boolean;
}

export const RevokeAccessPackageActionControl = ({
  availableActions,
  onRevoke,
  pkg,
  useDeleteConfirm = false,
  isLoading = false,
}: RevokeAccessPackageActionControlsProps) => {
  const { t } = useTranslation();
  if (availableActions?.includes(DelegationAction.REVOKE)) {
    if (pkg.deletableStatus === DeletableStatus.PartiallyDeletable) {
      return (
        <PackageIsPartiallyDeletableAlert
          confirmAction={onRevoke}
          triggerButtonProps={{
            size: 'sm',
            variant: 'text',
            icon: MinusCircleIcon,
          }}
        />
      );
    }
    if (useDeleteConfirm) {
      return (
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
          onConfirm={onRevoke}
        />
      );
    }
    return (
      <Button
        icon={MinusCircleIcon}
        variant='text'
        size='sm'
        onClick={onRevoke}
      >
        {isLoading ? (
          <DsSpinner
            aria-label={t('common.loading')}
            data-size='sm'
          />
        ) : (
          t('common.delete_poa')
        )}
      </Button>
    );
  }
  return null;
};

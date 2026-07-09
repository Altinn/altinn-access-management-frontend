import { Button, DsSpinner, formatDisplayName } from '@altinn/altinn-components';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { DelegationAction } from '../DelegationModal/EditModal';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';

import { DeletableStatus, type ExtendedAccessPackage } from './useAreaPackageList';
import { PackageIsPartiallyDeletableAlert } from './PackageIsPartiallyDeletableAlert/PackageIsPartiallyDeletableAlert';
import { packageActionControlId } from './PackageItem';

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
  const { toParty } = usePartyRepresentation();
  const ariaLabel = toParty
    ? t('common.delete_poa_to_name_for', {
        name: formatDisplayName({
          fullName: toParty.name,
          type: toParty.partyTypeName === PartyType.Person ? 'person' : 'company',
        }),
        poa_object: pkg.name,
      })
    : t('common.delete_poa_for', { poa_object: pkg.name });
  if (availableActions?.includes(DelegationAction.REVOKE)) {
    if (pkg.deletableStatus === DeletableStatus.PartiallyDeletable) {
      return (
        <PackageIsPartiallyDeletableAlert
          confirmAction={onRevoke}
          triggerButtonProps={{
            id: packageActionControlId(pkg.id),
            'data-size': 'sm',
            variant: 'tertiary',
            'aria-label': ariaLabel,
          }}
        />
      );
    }
    return (
      <Button
        id={packageActionControlId(pkg.id)}
        variant='tertiary'
        size='sm'
        onClick={onRevoke}
        aria-label={ariaLabel}
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

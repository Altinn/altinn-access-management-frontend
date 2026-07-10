import { Button, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { displayPackageRequests } from '@/resources/utils/featureFlagUtils';

import { packageActionControlId } from './PackageItem';

interface DelegateAccessPackageActionControlsProps {
  isLoading: boolean;
  isPackageLoading?: boolean;
  availableActions?: DelegationAction[];
  onDelegate: () => void;
  onRequest: () => void;
  onDeleteRequest: () => void;
  canDelegate: boolean;
  isPendingRequest: boolean;
  disabled?: boolean;
  accessPackageName?: string;
  packageId: string;
}

export const DelegateAccessPackageActionControl = ({
  isLoading,
  isPackageLoading = false,
  availableActions,
  canDelegate,
  onRequest,
  onDeleteRequest,
  onDelegate,
  isPendingRequest,
  accessPackageName,
  disabled = false,
  packageId,
}: DelegateAccessPackageActionControlsProps) => {
  const { t } = useTranslation();
  const displayPackageRequestsFeature = displayPackageRequests();
  const actionId = packageActionControlId(packageId);

  if (isLoading) {
    return (
      <DsSpinner
        data-size='xs'
        aria-hidden='true'
      />
    );
  }

  if (availableActions?.includes(DelegationAction.DELEGATE) && canDelegate) {
    return (
      <Button
        id={actionId}
        variant='tertiary'
        size='sm'
        onClick={onDelegate}
        disabled={disabled}
        aria-label={t('common.give_poa_for', { poa_object: accessPackageName })}
      >
        <PlusCircleIcon aria-hidden='true' />
        {t('common.give_poa')}
      </Button>
    );
  }
  if (availableActions?.includes(DelegationAction.REQUEST) && displayPackageRequestsFeature) {
    if (isPendingRequest) {
      return (
        <Button
          id={actionId}
          variant='tertiary'
          size='sm'
          loading={isPackageLoading}
          disabled={disabled}
          onClick={onDeleteRequest}
          aria-label={t('common.delete_request_for', { poa_object: accessPackageName })}
        >
          <MinusCircleIcon aria-hidden='true' />
          {t('delegation_modal.request.delete_request')}
        </Button>
      );
    }

    return (
      <Button
        id={actionId}
        variant='tertiary'
        size='sm'
        loading={isPackageLoading}
        disabled={disabled}
        onClick={onRequest}
        aria-label={t('common.request_poa_for', { poa_object: accessPackageName })}
      >
        <PlusCircleIcon aria-hidden='true' />
        {t('common.request_poa')}
      </Button>
    );
  }
  return null;
};

import { Button, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { displayPackageRequests } from '@/resources/utils/featureFlagUtils';

interface DelegateAccessPackageActionControlsProps {
  isLoading: boolean;
  availableActions?: DelegationAction[];
  onDelegate: () => void;
  onRequest: () => void;
  onDeleteRequest: () => void;
  canDelegate: boolean;
  isPendingRequest: boolean;
  disabled?: boolean;
  accessPackageName?: string;
}

export const DelegateAccessPackageActionControl = ({
  isLoading,
  availableActions,
  canDelegate,
  onRequest,
  onDeleteRequest,
  onDelegate,
  isPendingRequest,
  accessPackageName,
  disabled = false,
}: DelegateAccessPackageActionControlsProps) => {
  const { t } = useTranslation();
  const displayPackageRequestsFeature = displayPackageRequests();

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
        variant='tertiary'
        size='sm'
        onClick={onDelegate}
        disabled={disabled}
        aria-label={t('common.give_poa_for', { poa_object: accessPackageName })}
      >
        <PlusCircleIcon />
        {t('common.give_poa')}
      </Button>
    );
  }
  if (availableActions?.includes(DelegationAction.REQUEST) && displayPackageRequestsFeature) {
    if (isPendingRequest) {
      return (
        <Button
          variant='tertiary'
          size='sm'
          onClick={onDeleteRequest}
          aria-label={t('common.delete_request_for', { poa_object: accessPackageName })}
        >
          <MinusCircleIcon />
          {t('delegation_modal.request.delete_request')}
        </Button>
      );
    }

    return (
      <Button
        variant='tertiary'
        size='sm'
        disabled={disabled}
        onClick={onRequest}
        aria-label={t('common.request_poa_for', { poa_object: accessPackageName })}
      >
        <PlusCircleIcon />
        {t('common.request_poa')}
      </Button>
    );
  }
  return null;
};

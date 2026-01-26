import { Button, DsSpinner } from '@altinn/altinn-components';
import { PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { DelegationAction } from '../DelegationModal/EditModal';
import { displayAccessRequest } from '@/resources/utils/featureFlagUtils';

interface DelegateAccessPackageActionControlsProps {
  isLoading: boolean;
  availableActions?: DelegationAction[];
  onDelegate: () => void;
  onRequest: () => void;
  canDelegate: boolean;
  disabled?: boolean;
  accessPackageName?: string;
}

export const DelegateAccessPackageActionControl = ({
  isLoading,
  availableActions,
  canDelegate,
  onRequest,
  onDelegate,
  accessPackageName,
  disabled = false,
}: DelegateAccessPackageActionControlsProps) => {
  const { t } = useTranslation();
  const displayAccessRequestFeature = displayAccessRequest();

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
  if (availableActions?.includes(DelegationAction.REQUEST) && displayAccessRequestFeature) {
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

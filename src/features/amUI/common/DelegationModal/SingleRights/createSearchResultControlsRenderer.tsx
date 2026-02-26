import { DsButton } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { DelegationAction } from '../EditModal';

type UseRenderSearchResultControlProps = {
  isDelegated: (resourceId: string) => boolean;
  availableActions?: DelegationAction[];
  isResourceLoading: (resourceId: string) => boolean;
  setActionError: (error: ActionError | null) => void;
  revokeFromList: (resource: ServiceResource) => void;
  delegateFromList: (resource: ServiceResource) => void;
};

export const useRenderSearchResultControl = ({
  isDelegated,
  availableActions,
  isResourceLoading,
  setActionError,
  revokeFromList,
  delegateFromList,
}: UseRenderSearchResultControlProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobileOrSmaller();

  return (resource: ServiceResource) => {
    const isAlreadyDelegated = isDelegated(resource.identifier);
    const canRevoke = availableActions?.includes(DelegationAction.REVOKE);
    const canDelegate = availableActions?.includes(DelegationAction.DELEGATE);
    const isLoading = isResourceLoading(resource.identifier);

    if (isAlreadyDelegated && canRevoke) {
      return (
        <DsButton
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading}
          onClick={() => {
            setActionError(null);
            revokeFromList(resource);
          }}
          aria-label={t('common.delete_poa_for', { poa_object: resource.title })}
        >
          <MinusCircleIcon aria-hidden='true' />
          {!isMobile && t('common.delete_poa')}
        </DsButton>
      );
    }

    if (!isAlreadyDelegated && canDelegate) {
      return (
        <DsButton
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading}
          onClick={() => {
            setActionError(null);
            delegateFromList(resource);
          }}
          aria-label={t('common.give_poa_for', { poa_object: resource.title })}
        >
          <PlusCircleIcon aria-hidden='true' />
          {!isMobile && t('common.give_poa')}
        </DsButton>
      );
    }

    return null;
  };
};

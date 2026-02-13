import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useRemoveMyClientProviderMutation } from '@/rtk/features/clientApi';
import { DeleteClientProviderModal } from '../common/DeleteClientProviderModal/DeleteClientProviderModal';
import { handleSelectAccount } from '../common/PageLayoutWrapper/useHeader';

interface MyClientsDeleteClientProviderModalProps {
  provider?: string;
  providerName: string;
  selfPartyUuid?: string;
  disabled?: boolean;
}

export const MyClientsDeleteClientProviderModal = ({
  provider,
  providerName,
  selfPartyUuid,
  disabled = false,
}: MyClientsDeleteClientProviderModalProps) => {
  const { t } = useTranslation();
  const [removeMyClientProvider] = useRemoveMyClientProviderMutation();

  const onConfirmDelete = useCallback(async () => {
    if (!provider || !selfPartyUuid) {
      return;
    }

    await removeMyClientProvider({ provider }).unwrap();
    handleSelectAccount(selfPartyUuid);
  }, [provider, removeMyClientProvider, selfPartyUuid]);

  return (
    <DeleteClientProviderModal
      triggerLabel={t('my_clients_page.delete_provider_button')}
      heading={t('my_clients_page.delete_provider_heading')}
      body={t('my_clients_page.delete_provider_body', { name: providerName })}
      confirmLabel={t('my_clients_page.delete_provider_confirm')}
      disabled={disabled || !provider || !selfPartyUuid}
      onConfirm={onConfirmDelete}
    />
  );
};

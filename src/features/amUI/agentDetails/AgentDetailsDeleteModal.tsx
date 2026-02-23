import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useRemoveAgentMutation } from '@/rtk/features/clientApi';
import { DeleteClientProviderModal } from '../common/DeleteClientProviderModal/DeleteClientProviderModal';

interface AgentDetailsDeleteModalProps {
  agentId?: string;
  backUrl: string;
}

export const AgentDetailsDeleteModal = ({ agentId, backUrl }: AgentDetailsDeleteModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [removeAgent] = useRemoveAgentMutation();

  const onConfirmDelete = useCallback(async () => {
    if (!agentId) {
      return;
    }

    await removeAgent({ to: agentId }).unwrap();
    navigate(backUrl);
  }, [agentId, backUrl, navigate, removeAgent]);

  return (
    <DeleteClientProviderModal
      triggerLabel={t('client_administration_page.agent_delete_button')}
      heading={t('client_administration_page.agent_delete_heading')}
      body={t('client_administration_page.agent_delete_body')}
      confirmLabel={t('client_administration_page.agent_delete_confirm')}
      disabled={!agentId}
      onConfirm={onConfirmDelete}
    />
  );
};

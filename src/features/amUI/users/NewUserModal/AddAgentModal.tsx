import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAddAgentMutation } from '@/rtk/features/clientApi';
import { type User } from '@/rtk/features/userInfoApi';

import { AddUserDialog } from '../../common/AddUserDialog/AddUserDialog';
import type { Recipient } from '../../common/AddUserDialog/recipient';

interface AddAgentButtonProps {
  variant: 'primary' | 'secondary';
  onComplete?: (user: User) => void;
}

export const AddAgentButton: React.FC<AddAgentButtonProps> = ({ variant, onComplete }) => {
  const { t } = useTranslation();
  const [addAgent] = useAddAgentMutation();

  const handleAddAgent = async (recipient: Recipient) => {
    if (recipient.kind !== 'person') {
      return;
    }
    const assignment = await addAgent({
      personInput: {
        personIdentifier: recipient.personIdentifier,
        lastName: recipient.lastName,
      },
    }).unwrap();
    onComplete?.({
      id: assignment.toId || assignment.id,
      name: recipient.lastName,
      type: 'person',
      children: null,
    });
  };

  return (
    <AddUserDialog
      recipientKinds={[{ type: 'person', submitLabel: t('new_user_modal.add_person_button') }]}
      triggerLabel={t('client_administration_page.add_agent_button')}
      triggerVariant={variant}
      heading={t('client_administration_page.add_agent_button')}
      onSubmit={handleAddAgent}
    />
  );
};

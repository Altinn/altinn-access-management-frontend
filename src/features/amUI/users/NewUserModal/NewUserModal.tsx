import React from 'react';
import { useTranslation } from 'react-i18next';

import { type User } from '@/rtk/features/userInfoApi';
import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';

import { AddUserDialog } from '../../common/AddUserDialog/AddUserDialog';
import { toAddRightHolderArgs, type Recipient } from '../../common/AddUserDialog/recipient';

/**
 * NewUserButton component renders a button that, when clicked, opens a modal to add a new user.
 * @component
 */
interface NewUserButtonProps {
  variant: 'primary' | 'secondary';
  onComplete?: (user: User) => void;
}

export const NewUserButton: React.FC<NewUserButtonProps> = ({ variant, onComplete }) => {
  const { t } = useTranslation();
  const [addRightHolder] = useAddRightHolderMutation();

  const handleSubmit = async (recipient: Recipient) => {
    const toUuid = await addRightHolder(toAddRightHolderArgs(recipient)).unwrap();
    onComplete?.(
      recipient.kind === 'person'
        ? { id: toUuid, name: recipient.lastName, type: 'person', children: null }
        : {
            id: recipient.organization.partyUuid,
            name: recipient.organization.name,
            type: 'organisasjon',
            children: null,
            organizationIdentifier: recipient.organization.orgNumber,
          },
    );
  };

  return (
    <AddUserDialog
      recipientKinds={[
        { type: 'person', submitLabel: t('new_user_modal.add_person_button') },
        { type: 'org', submitLabel: t('new_user_modal.add_org_button') },
      ]}
      triggerLabel={t('new_user_modal.trigger_button')}
      triggerVariant={variant}
      heading={t('new_user_modal.modal_title')}
      onSubmit={handleSubmit}
    />
  );
};

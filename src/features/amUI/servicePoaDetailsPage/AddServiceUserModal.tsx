import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';
import { useDelegateRightsMutation } from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserDialog } from '../common/AddUserDialog/AddUserDialog';
import { toAddRightHolderArgs, type Recipient } from '../common/AddUserDialog/recipient';
import { RightsPicker } from '../common/RightsPicker/RightsPicker';
import { useDelegableRights } from '../common/RightsPicker/useDelegableRights';

interface AddServiceUserButtonProps {
  resourceId: string;
}

/**
 * Adds a person or an organisation as a right holder and gives them the service in one step.
 *
 * The single rights API delegates to a party uuid, which a brand-new right holder does not have
 * yet, so submitting creates the right holder first and delegates with the uuid that comes back.
 * The actions are picked alongside the recipient because neither the rights meta nor the delegation
 * check depends on who the recipient is.
 */
export const AddServiceUserButton = ({ resourceId }: AddServiceUserButtonProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const [addRightHolder] = useAddRightHolderMutation();
  const [delegateRights] = useDelegateRightsMutation();
  const [isOpen, setIsOpen] = useState(false);

  const { rights, setRights, resetRights, isLoading, errorDetails } = useDelegableRights({
    resourceId,
    isEnabled: isOpen,
  });

  const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);

  // The single rights API delegates to a party uuid, so the right holder is created first and the
  // uuid that comes back is what the delegation is made to.
  const handleSubmit = async (recipient: Recipient) => {
    const toUuid = await addRightHolder(toAddRightHolderArgs(recipient)).unwrap();
    await delegateRights({
      partyUuid: actingParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid,
      resourceId,
      actionKeys,
    }).unwrap();
  };

  return (
    <AddUserDialog
      recipientKinds={[
        { type: 'person', submitLabel: t('common.give_poa') },
        { type: 'org', submitLabel: t('common.give_poa') },
      ]}
      triggerLabel={t('new_user_modal.trigger_button')}
      triggerVariant='primary'
      heading={t('service_poa_details_page.add_user_modal.heading')}
      width='wide'
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetRights();
        }
      }}
      isSubmitDisabled={
        !actingParty?.partyUuid ||
        !fromParty?.partyUuid ||
        actionKeys.length === 0 ||
        isLoading ||
        !!errorDetails
      }
      onSubmit={handleSubmit}
    >
      <RightsPicker
        heading={t('service_poa_details_page.add_user_modal.user_will_receive')}
        rights={rights}
        setRights={setRights}
        accessToAllLabel={t('delegation_modal.actions.access_to_all')}
        actionDescription={t('delegation_modal.actions.action_description')}
        isLoading={isLoading}
        errorDetails={errorDetails}
        errorContext={`resource: ${resourceId}`}
      />
    </AddUserDialog>
  );
};

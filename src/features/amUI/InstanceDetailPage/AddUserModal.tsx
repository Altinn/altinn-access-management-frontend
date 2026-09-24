import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { connectionApi } from '@/rtk/features/connectionApi';
import { useDelegateInstanceRightsMutation } from '@/rtk/features/instanceApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserDialog } from '../common/AddUserDialog/AddUserDialog';
import type { Recipient } from '../common/AddUserDialog/recipient';
import { RightsPicker } from '../common/RightsPicker/RightsPicker';
import { useDelegableRights } from '../common/RightsPicker/useDelegableRights';

interface AddUserButtonProps {
  resourceId: string;
  instanceUrn: string;
}

export const AddUserButton = ({ resourceId, instanceUrn }: AddUserButtonProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const dispatch = useDispatch();
  const [delegateInstanceRights] = useDelegateInstanceRightsMutation();
  const [isOpen, setIsOpen] = useState(false);

  const { rights, setRights, resetRights, isLoading, errorDetails } = useDelegableRights({
    resourceId,
    instanceUrn,
    isEnabled: isOpen,
  });

  const directRightKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);

  const handleSubmit = async (recipient: Recipient) => {
    if (recipient.kind !== 'person') {
      return;
    }
    await delegateInstanceRights({
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
      input: {
        to: {
          personIdentifier: recipient.personIdentifier,
          lastName: recipient.lastName,
        },
        directRightKeys,
      },
    }).unwrap();
    dispatch(connectionApi.util.invalidateTags(['Connections']));
  };

  return (
    <AddUserDialog
      recipientKinds={[{ type: 'person', submitLabel: t('common.give_poa') }]}
      triggerLabel={t('new_user_modal.trigger_button')}
      triggerVariant='primary'
      heading={t('instance_detail_page.add_user_modal.heading')}
      width='wide'
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetRights();
        }
      }}
      isSubmitDisabled={
        !actingParty?.partyUuid || directRightKeys.length === 0 || isLoading || !!errorDetails
      }
      onSubmit={handleSubmit}
    >
      <RightsPicker
        heading={t('instance_detail_page.add_user_modal.user_will_receive')}
        rights={rights}
        setRights={setRights}
        accessToAllLabel={t('delegation_modal.instance_actions.access_to_all')}
        actionDescription={t('delegation_modal.instance_actions.action_description')}
        isLoading={isLoading}
        errorDetails={errorDetails}
        errorContext={`resource: ${resourceId} - instance: ${instanceUrn}`}
      />
    </AddUserDialog>
  );
};

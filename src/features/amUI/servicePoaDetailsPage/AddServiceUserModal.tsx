import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAddRightHolderMutation } from '@/rtk/features/connectionApi';
import {
  useDelegateRightsMutation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserDialog } from '../common/AddUserDialog/AddUserDialog';
import { toAddRightHolderArgs, type Recipient } from '../common/AddUserDialog/recipient';
import { ResourceAlert } from '../common/DelegationModal/SingleRights/ResourceAlert';
import { RightsPicker } from '../common/RightsPicker/RightsPicker';
import { useDelegableRights } from '../common/RightsPicker/useDelegableRights';

/** The user as the dialog knows them: a person is only known by the last name that was typed. */
export interface AddedServiceUser {
  name: string;
  type: 'person' | 'org';
}

interface AddServiceUserButtonProps {
  /*** The whole resource, not just its id: ResourceAlert reports on the service itself */
  resource?: ServiceResource;
  /*** Called once the user both exists and holds the service */
  onUserAdded: (user: AddedServiceUser) => void;
}

/**
 * Adds a person or an organisation as a right holder and gives them the service in one step.
 *
 * The single rights API delegates to a party uuid, which a brand-new right holder does not have
 * yet, so submitting creates the right holder first and delegates with the uuid that comes back.
 * The actions are picked alongside the recipient because neither the rights meta nor the delegation
 * check depends on who the recipient is.
 */
export const AddServiceUserButton = ({ resource, onUserAdded }: AddServiceUserButtonProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();
  const resourceId = resource?.identifier ?? '';

  const [addRightHolder] = useAddRightHolderMutation();
  const [delegateRights] = useDelegateRightsMutation();
  const [isOpen, setIsOpen] = useState(false);

  const { rights, setRights, resetRights, isLoading, errorDetails } = useDelegableRights({
    resourceId,
    isEnabled: isOpen,
  });

  const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);

  // Same shape as the other resource modals, minus their `hasAccess` term: the user being added is
  // new, so there is never an existing delegation to fall back on. Without it the picker would
  // render empty, since RightsChipList drops every action that cannot be given.
  const displayResourceAlert =
    !!errorDetails ||
    resource?.delegable === false ||
    (rights.length > 0 && !rights.some((r) => r.delegable === true));

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

    // A brand-new person has no name until the list reloads, so the last name that was typed is
    // what is reported — as the other add-user flows do. The page holds the confirmation until that
    // list has arrived, by which time this dialog has closed: a snackbar raised over an open dialog
    // is not announced, because screen readers scope the live region to the dialog.
    onUserAdded({
      name: recipient.kind === 'person' ? recipient.lastName : recipient.organization.name,
      type: recipient.kind,
    });
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
        displayResourceAlert
      }
      onSubmit={handleSubmit}
    >
      {resource && displayResourceAlert ? (
        <ResourceAlert
          error={errorDetails}
          rightReasons={rights.map((r) => r.delegationReason)}
          resource={resource}
        />
      ) : (
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
      )}
    </AddUserDialog>
  );
};

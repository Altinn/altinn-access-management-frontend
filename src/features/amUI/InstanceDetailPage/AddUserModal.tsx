import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { PlusIcon } from '@navikt/aksel-icons';

import { getActionError } from '@/resources/hooks/useActionError';
import { connectionApi } from '@/rtk/features/connectionApi';
import { useDelegateInstanceRightsMutation } from '@/rtk/features/instanceApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { AddUserForm } from '../common/AddUserForm/AddUserForm';
import type { Recipient } from '../common/AddUserForm/recipient';
import { SubmitErrorAlert, type SubmitError } from '../common/AddUserForm/SubmitErrorAlert';
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
  const modalRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // jsdom's close() does not dispatch a close event, so this is not read off the dialog element.
  const [isOpen, setIsOpen] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [delegateInstanceRights, { isLoading: isSubmitting }] = useDelegateInstanceRightsMutation();

  const { rights, setRights, resetRights, isLoading, errorDetails } = useDelegableRights({
    resourceId,
    instanceUrn,
    isEnabled: isOpen,
  });

  const directRightKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);

  const close = () => {
    setIsOpen(false);
    setSubmitError(null);
    resetRights();
    modalRef.current?.close();
  };

  const handleSubmit = async (recipient: Recipient) => {
    if (recipient.kind !== 'person') {
      return;
    }
    setSubmitError(null);
    try {
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
    } catch (error: unknown) {
      setSubmitError({ error: getActionError(error), recipientKind: 'person' });
      return;
    }
    dispatch(connectionApi.util.invalidateTags(['Connections']));
    close();
  };

  return (
    <>
      <DsButton
        variant='primary'
        onClick={() => {
          setIsOpen(true);
          modalRef.current?.showModal();
        }}
      >
        <PlusIcon aria-hidden='true' />
        {t('new_user_modal.trigger_button')}
      </DsButton>
      <DsDialog
        ref={modalRef}
        closedby='any'
        aria-labelledby={headingId}
        onClose={close}
      >
        {isOpen && (
          <AddUserForm
            heading={t('instance_detail_page.add_user_modal.heading')}
            headingId={headingId}
            recipientKinds={[{ type: 'person', submitLabel: t('common.give_poa') }]}
            isSubmitDisabled={
              !actingParty?.partyUuid || directRightKeys.length === 0 || isLoading || !!errorDetails
            }
            isSubmitting={isSubmitting}
            onSubmit={(recipient) => void handleSubmit(recipient)}
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
            <SubmitErrorAlert submitError={submitError} />
          </AddUserForm>
        )}
      </DsDialog>
    </>
  );
};

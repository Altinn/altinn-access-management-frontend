import type { Ref } from 'react';
import { DsDialog } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from '../common/DelegationModal/DelegationModal.module.css';
import type { DelegationAction } from '../common/DelegationModal/EditModal';
import { ResourceInfo } from '../common/DelegationModal/SingleRights/ResourceInfo';
import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import type { UserActionTarget } from '../common/UserSearch/types';

interface ServiceUserModalProps {
  resource: ServiceResource;
  /** The user the dialog is opened for. Becomes the toParty of the nested party representation. */
  user: UserActionTarget;
  /** The reportee, which is both the acting party and the party the service is delegated from. */
  partyUuid: string;
  availableActions: DelegationAction[];
  onClose: () => void;
  ref?: Ref<HTMLDialogElement>;
}

/**
 * Per-user dialog for a single service.
 *
 * ResourceInfo reads the recipient from PartyRepresentationContext rather than from a prop, so the
 * dialog nests its own provider with the picked user as toParty. That keeps the whole single-rights
 * machinery (rights meta, delegation check, delegate/update/revoke) reusable here untouched, and is
 * why the recipient can differ per row on a page whose outer provider only knows the reportee.
 */
export const ServiceUserModal = ({
  resource,
  user,
  partyUuid,
  availableActions,
  onClose,
  ref,
}: ServiceUserModalProps) => {
  const { t } = useTranslation();

  return (
    <DsDialog
      ref={ref}
      className={classes.modalDialog}
      closedby='any'
      onClose={onClose}
      aria-label={t('delegation_modal.aria_label.single_rights')}
      aria-description={t('delegation_modal.aria_description')}
    >
      <div className={classes.content}>
        <PartyRepresentationProvider
          actingPartyUuid={partyUuid}
          fromPartyUuid={partyUuid}
          toPartyUuid={user.id}
        >
          <ResourceInfo
            resource={resource}
            availableActions={availableActions}
          />
        </PartyRepresentationProvider>
      </div>
    </DsDialog>
  );
};

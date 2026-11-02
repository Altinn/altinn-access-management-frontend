import { Trans, useTranslation } from 'react-i18next';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { DelegationDialog } from '../DelegationDialog';
import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';

import { ResourceSearch } from './ResourceSearch';
import { ResourceInfo } from './ResourceInfo';

interface SingleRightsDelegationModalProps {
  availableActions?: DelegationAction[];
}

export const SingleRightsDelegationModal = ({
  availableActions = [],
}: SingleRightsDelegationModalProps) => {
  const { t } = useTranslation();
  const { setInfoView, setResourceToView, resourceToView, setActionError } =
    useDelegationModalContext();
  const { toParty } = usePartyRepresentation();

  const onSelection = (resource?: ServiceResource, error = false) => {
    if (!error) {
      setActionError(null);
    }
    setInfoView(true);
    setResourceToView(resource);
  };

  // if this dialog is open, availableActions has either DELEGATE or REQUEST
  const canDelegate = availableActions.includes(DelegationAction.DELEGATE);

  return (
    <DelegationDialog
      title={
        <Trans
          i18nKey={
            canDelegate
              ? 'delegation_modal.give_service_to_name'
              : 'delegation_modal.request_service'
          }
          values={{ name: formatEntityDisplayName(toParty) }}
          components={{ strong: <strong /> }}
        />
      }
      triggerText={
        canDelegate
          ? t('single_rights.give_new_single_right')
          : t('delegation_modal.request.request_service')
      }
      focusTargetId={resourceToView?.identifier}
      searchView={
        <ResourceSearch
          onSelect={onSelection}
          toParty={toParty}
          availableActions={availableActions}
        />
      }
      infoView={
        resourceToView && (
          <ResourceInfo
            resource={resourceToView}
            availableActions={availableActions}
          />
        )
      }
    />
  );
};

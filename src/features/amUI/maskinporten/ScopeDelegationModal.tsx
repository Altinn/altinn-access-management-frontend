import { Trans, useTranslation } from 'react-i18next';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationDialog } from '../common/DelegationModal/DelegationDialog';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import type { DelegationAction } from '../common/DelegationModal/EditModal';

import { ScopeSearch } from './ScopeSearch';
import { ScopeInfo } from './ScopeInfo';

interface ScopeDelegationModalProps {
  availableActions?: DelegationAction[];
}

export const ScopeDelegationModal = ({ availableActions = [] }: ScopeDelegationModalProps) => {
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

  return (
    <DelegationDialog
      title={
        <Trans
          i18nKey='maskinporten_page.search_scopes_heading'
          values={{ name: formatEntityDisplayName(toParty) }}
          components={{ strong: <strong /> }}
        />
      }
      triggerText={t('maskinporten_page.add_scope_button')}
      focusTargetId={resourceToView?.identifier}
      searchView={<ScopeSearch onSelect={onSelection} />}
      infoView={
        resourceToView && (
          <ScopeInfo
            resource={resourceToView}
            availableActions={availableActions}
          />
        )
      }
    />
  );
};

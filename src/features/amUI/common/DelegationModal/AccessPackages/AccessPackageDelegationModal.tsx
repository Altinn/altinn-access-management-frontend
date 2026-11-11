import { Trans, useTranslation } from 'react-i18next';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { useAreaExpandedState } from '../../AccessPackageList/useAreaExpandedState';
import { DelegationDialog } from '../DelegationDialog';
import { useDelegationModalContext } from '../DelegationModalContext';
import { DelegationAction } from '../EditModal';

import { PackageSearch } from './PackageSearch';
import { AccessPackageInfo } from './AccessPackageInfo';

interface AccessPackageDelegationModalProps {
  availableActions?: DelegationAction[];
}

export const AccessPackageDelegationModal = ({
  availableActions = [],
}: AccessPackageDelegationModalProps) => {
  const { t } = useTranslation();
  const { setInfoView, setPackageToView, packageToView, setActionError } =
    useDelegationModalContext();
  const { toParty } = usePartyRepresentation();
  // Owned here, not in the list, so expanded areas survive switching to the info view and back
  const expandedState = useAreaExpandedState();

  const onSelection = (accessPackage?: AccessPackage, error = false) => {
    if (!error) {
      setActionError(null);
    }
    setInfoView(true);
    setPackageToView(accessPackage);
  };

  // if this dialog is open, availableActions has either DELEGATE or REQUEST
  const canDelegate = availableActions.includes(DelegationAction.DELEGATE);

  return (
    <DelegationDialog
      title={
        <Trans
          i18nKey={
            canDelegate
              ? 'delegation_modal.give_package_to_name'
              : 'delegation_modal.request_package'
          }
          values={{ name: formatEntityDisplayName(toParty) }}
          components={{ strong: <strong /> }}
        />
      }
      triggerText={canDelegate ? t('access_packages.give_new_button') : t('common.request_poa')}
      focusTargetId={packageToView?.id}
      onClose={expandedState.closeAllAreas}
      searchView={
        <PackageSearch
          onSelection={onSelection}
          toParty={toParty}
          onActionError={(accessPackage: AccessPackage) => onSelection(accessPackage, true)}
          availableActions={availableActions}
          expandedState={expandedState}
        />
      }
      infoView={
        packageToView && (
          <AccessPackageInfo
            accessPackage={packageToView}
            availableActions={availableActions}
          />
        )
      }
    />
  );
};

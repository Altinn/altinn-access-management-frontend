import { Trans, useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';
import { type JSX } from 'react';
import { DsDialog, formatDisplayName } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useAreaExpandedContextOrLocal } from '../AccessPackageList/AccessPackageExpandedContext';
import { useRestoreFocus } from '../RestoreFocus';
import { TwoStepDialog } from '../TwoStepDialog';
import { ScopeSearch } from '../../maskinporten/ScopeSearch';
import { ScopeInfo } from '../../maskinporten/ScopeInfo';

import classes from './DelegationModal.module.css';
import { ResourceSearch } from './SingleRights/ResourceSearch';
import { ResourceInfo } from './SingleRights/ResourceInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { DelegationType } from './DelegationModal';
import { PackageSearch } from './AccessPackages/PackageSearch';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { DelegationAction } from './EditModal';

export interface DelegationModalProps {
  delegationType: DelegationType;
  availableActions?: DelegationAction[];
}

export const DelegationModalContent = ({
  delegationType,
  availableActions,
}: DelegationModalProps) => {
  const { t } = useTranslation();
  const {
    setInfoView,
    setResourceToView,
    resourceToView,
    setPackageToView,
    packageToView,
    infoView,
    reset,
    setActionError,
  } = useDelegationModalContext();
  const { toParty } = usePartyRepresentation();
  const { closeAllAreas } = useAreaExpandedContextOrLocal();
  const restoreFocus = useRestoreFocus();

  const onResourceSelection = (resource?: ServiceResource, error = false) => {
    if (!error) {
      setActionError(null);
    }
    setInfoView(true);
    setResourceToView(resource);
  };

  const onPackageSelection = (accessPackage?: AccessPackage, error = false) => {
    if (!error) {
      setActionError(null);
    }
    setInfoView(true);
    setPackageToView(accessPackage);
  };

  const onClosing = () => {
    reset();
    closeAllAreas();
  };

  const onBack = () => {
    const focusTargetId = packageToView?.id ?? resourceToView?.identifier;
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    setInfoView(false);
  };

  const toPartyName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  const hasDelegateAccess = (availableActions ?? []).includes(DelegationAction.DELEGATE);
  const isRequest = (availableActions ?? []).includes(DelegationAction.REQUEST);

  let searchViewContent: JSX.Element | undefined;
  let infoViewContent: JSX.Element | undefined;
  let triggerButtonText: string | undefined;
  let title: JSX.Element | undefined;

  switch (delegationType) {
    case DelegationType.AccessPackage:
      searchViewContent = (
        <PackageSearch
          onSelection={onPackageSelection}
          toParty={toParty}
          onActionError={(accessPackage: AccessPackage) => {
            onPackageSelection(accessPackage, true);
          }}
          availableActions={availableActions}
        />
      );
      infoViewContent = packageToView && (
        <AccessPackageInfo
          accessPackage={packageToView}
          availableActions={availableActions}
        />
      );
      triggerButtonText = hasDelegateAccess
        ? t('access_packages.give_new_button')
        : t('common.request_poa');
      title = (
        <Trans
          i18nKey={
            isRequest ? 'delegation_modal.request_package' : 'delegation_modal.give_package_to_name'
          }
          values={{ name: toPartyName }}
          components={{ strong: <strong /> }}
        />
      );
      break;
    case DelegationType.MaskinportenScope:
      searchViewContent = <ScopeSearch onSelect={onResourceSelection} />;
      infoViewContent = resourceToView && <ScopeInfo resource={resourceToView} />;
      triggerButtonText = t('maskinporten_page.add_scope_button');
      title = (
        <Trans
          i18nKey='maskinporten_page.search_scopes_heading'
          values={{ name: toPartyName }}
          components={{ strong: <strong /> }}
        />
      );
      break;
    default:
      searchViewContent = (
        <ResourceSearch
          onSelect={onResourceSelection}
          toParty={toParty}
          availableActions={availableActions}
        />
      );
      infoViewContent = resourceToView && (
        <ResourceInfo
          resource={resourceToView}
          availableActions={availableActions}
        />
      );
      triggerButtonText = hasDelegateAccess
        ? t('single_rights.give_new_single_right')
        : t('delegation_modal.request.request_service');
      title = (
        <Trans
          i18nKey={
            isRequest ? 'delegation_modal.request_service' : 'delegation_modal.give_service_to_name'
          }
          values={{ name: toPartyName }}
          components={{ strong: <strong /> }}
        />
      );
  }

  return (
    <TwoStepDialog
      title={title}
      isDetailView={infoView}
      onBack={onBack}
      onClose={onClosing}
      restoreFocus={restoreFocus}
      aria-description={t('delegation_modal.aria_description')}
      trigger={
        <DsDialog.Trigger
          data-size='sm'
          variant='primary'
          className={classes.triggerButton}
        >
          <PlusIcon aria-hidden='true' />
          {triggerButtonText}
        </DsDialog.Trigger>
      }
    >
      {infoView ? infoViewContent : searchViewContent}
    </TwoStepDialog>
  );
};

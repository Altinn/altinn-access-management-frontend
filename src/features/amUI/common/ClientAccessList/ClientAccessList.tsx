import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  Button,
  DsParagraph,
  type Color,
  type UserListItemProps,
} from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type { Client } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import {
  getFormattedDateOfBirthLabel,
  formatOrgNr,
  isSubUnitByType,
} from '@/resources/utils/reporteeUtils';

import { buildClientParentNameById, buildClientSortKey } from '../clientSortUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { AccessPackageListItems } from '../AccessPackageListItems/AccessPackageListItems';
import {
  clientPackageActionFocusId,
  clientPackageRowFocusId,
} from '../AccessPackageListItems/clientPackageFocusIds';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import {
  ClientPackageInfoModal,
  type ClientPackageModalData,
} from '../DelegationModal/AccessPackages/ClientPackageInfoModal';
import { RestoreFocusProvider, useRestoreFocus } from '../RestoreFocus';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { Party } from '@/rtk/features/lookupApi';

// Tracks an inline delegate/revoke awaiting settle, so focus can be restored to the action button
// once its row's access has flipped (the "Gi"/"Slett" button swapped in place).
interface PendingSwapFocus {
  focusId: string;
  clientId: string;
  packageId: string;
  expectedHasAccess: boolean;
}

export type ClientAccessPackageAction = {
  clientId: string;
  roleCode: string;
  packageId: string;
  accessPackageName: string;
};

type ClientAccessListProps = {
  clients: Client[];
  accessStateClients?: Client[];
  addDisabled?: boolean;
  removeDisabled?: boolean;
  onAddAccessPackage?: (
    action: ClientAccessPackageAction,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void | Promise<void>;
  onRemoveAccessPackage?: (
    action: ClientAccessPackageAction,
    onSuccess?: () => void,
    onError?: () => void,
  ) => void | Promise<void>;
  searchPlaceholder?: string;
  requireDelegableForActions?: boolean;
  emptyAccessText?: string;
};

const getUserListItemType = (clientType: string): UserListItemProps['type'] => {
  return clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';
};

const sortClientsByKey = (clients: Client[], parentNameById: Map<string, string>): Client[] =>
  [...clients].sort((a, b) =>
    buildClientSortKey(a, parentNameById).localeCompare(buildClientSortKey(b, parentNameById)),
  );

export const ClientAccessList = ({
  clients,
  accessStateClients,
  addDisabled = false,
  removeDisabled = false,
  onAddAccessPackage,
  onRemoveAccessPackage,
  searchPlaceholder,
  requireDelegableForActions = true,
  emptyAccessText,
}: ClientAccessListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const isMobileOrSmaller = useIsMobileOrSmaller();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ClientPackageModalData | null>(null);
  const restoreFocus = useRestoreFocus();
  const [pendingSwapFocus, setPendingSwapFocus] = useState<PendingSwapFocus | null>(null);
  const clientsForAccessState = accessStateClients ?? clients;
  const parentNameById = buildClientParentNameById(clients);
  const sortedClients = sortClientsByKey(clients, parentNameById);

  const clientHasPackage = (clientId: string, packageId: string) =>
    clientsForAccessState.some(
      (aap) =>
        aap.client.id === clientId &&
        aap.access.some((p) => p.packages.some((ap) => ap.id === packageId)),
    );

  // Once an inline delegate/revoke has settled (the row's access flipped to the expected value and
  // the "Gi"/"Slett" button re-rendered in place), restore focus to that button.
  useEffect(() => {
    if (!pendingSwapFocus) {
      return;
    }
    const hasAccess = clientsForAccessState.some(
      (aap) =>
        aap.client.id === pendingSwapFocus.clientId &&
        aap.access.some((p) => p.packages.some((ap) => ap.id === pendingSwapFocus.packageId)),
    );
    if (hasAccess !== pendingSwapFocus.expectedHasAccess) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      restoreFocus.requestFocus(pendingSwapFocus.focusId);
      setPendingSwapFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [clientsForAccessState, pendingSwapFocus, restoreFocus]);

  const userListItems: UserListItemData[] = sortedClients.map((client) => {
    const clientId = client.client.id;
    const isSubUnit = isSubUnitByType(client.client.variant);
    const userType = getUserListItemType(client.client.type);
    const clientParty: Party = {
      partyId: 0,
      partyUuid: clientId,
      orgNumber: client.client.organizationIdentifier ?? undefined,
      name: client.client.name,
      partyTypeName: userType === 'company' ? PartyType.Organization : PartyType.Person,
      dateOfBirth: client.client.dateOfBirth ?? undefined,
      variant: client.client.variant ?? undefined,
    };

    const nodes = client.access.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = clientHasPackage(clientId, pkg.id);
        const accessPackage = getAccessPackageById(pkg.id);
        const actionIsDelegable = accessPackage?.isDelegable ?? false;
        const showAction = !requireDelegableForActions || actionIsDelegable;
        const packageName = accessPackage?.name || pkg.name;
        const roleDescription =
          access.role.code !== 'rettighetshaver'
            ? t('client_administration_page.via_role', { role: roleName })
            : undefined;

        const onDelegate = onAddAccessPackage
          ? (onSuccess?: () => void, onError?: () => void) =>
              onAddAccessPackage(
                {
                  clientId,
                  roleCode: access.role.code,
                  packageId: pkg.urn ?? '',
                  accessPackageName: packageName,
                },
                onSuccess,
                onError,
              )
          : undefined;
        const onRevoke = onRemoveAccessPackage
          ? (onSuccess?: () => void, onError?: () => void) =>
              onRemoveAccessPackage(
                {
                  clientId,
                  roleCode: access.role.code,
                  packageId: pkg.urn ?? '',
                  accessPackageName: packageName,
                },
                onSuccess,
                onError,
              )
          : undefined;

        const action = hasAccess ? onRevoke : onDelegate;
        const showModalTrigger = showAction && !!accessPackage && !!action;
        const rowFocusId = clientPackageRowFocusId(clientId, pkg.id);
        const actionFocusId = clientPackageActionFocusId(rowFocusId);

        let controls: React.ReactNode;
        if (!isMobileOrSmaller && showAction && hasAccess && onRevoke) {
          controls = (
            <Button
              id={actionFocusId}
              variant='tertiary'
              disabled={removeDisabled}
              onClick={() => {
                setPendingSwapFocus({
                  focusId: actionFocusId,
                  clientId,
                  packageId: pkg.id,
                  expectedHasAccess: false,
                });
                onRevoke();
              }}
            >
              <MinusCircleIcon aria-hidden='true' />
              {t('client_administration_page.remove_package_button')}
            </Button>
          );
        } else if (!isMobileOrSmaller && showAction && !hasAccess && onDelegate) {
          controls = (
            <Button
              id={actionFocusId}
              variant='tertiary'
              disabled={addDisabled}
              onClick={() => {
                setPendingSwapFocus({
                  focusId: actionFocusId,
                  clientId,
                  packageId: pkg.id,
                  expectedHasAccess: true,
                });
                onDelegate();
              }}
            >
              <PlusCircleIcon aria-hidden='true' />
              {t('client_administration_page.delegate_package_button')}
            </Button>
          );
        }

        return {
          id: rowFocusId,
          name: packageName,
          type: userType,
          isSubUnit,
          interactive: showModalTrigger,
          as: showModalTrigger ? 'button' : 'div',
          titleAs: 'h3',
          description: roleDescription ?? '',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          onClick:
            showModalTrigger && accessPackage
              ? () => {
                  setSelected({
                    party: clientParty,
                    accessPackage,
                    userHasAccess: hasAccess,
                    roleDescription,
                    onDelegate,
                    onRevoke: onRevoke ?? (() => {}),
                  });
                  modalRef.current?.showModal();
                }
              : undefined,
          controls,
        };
      });

      if (packages) {
        acc.push(...packages.filter((pkg): pkg is AccessPackageListItemProps => pkg !== null));
      }

      return acc;
    }, [] as AccessPackageListItemProps[]);

    return {
      id: clientId,
      name: client.client.name,
      organizationIdentifier: client.client.organizationIdentifier ?? undefined,
      type: userType,
      subUnit: isSubUnit,
      deleted: client.client.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      as: 'button',
      titleAs: 'h2',
      children:
        nodes.length === 0 && emptyAccessText ? (
          <DsParagraph>{emptyAccessText}</DsParagraph>
        ) : (
          <AccessPackageListItems items={nodes} />
        ),
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: formatOrgNr(client.client.organizationIdentifier),
            })
          : userType === 'person'
            ? getFormattedDateOfBirthLabel(client.client.dateOfBirth)
            : undefined,
    };
  });

  // Resolve the selected item's access live from the unfiltered access state, so the modal stays
  // correct after a mutation even when its row leaves the rendered (filtered) list.
  const modalData: ClientPackageModalData | undefined = selected
    ? {
        ...selected,
        userHasAccess: clientHasPackage(selected.party.partyUuid, selected.accessPackage.id),
      }
    : undefined;

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <UserListItems
        items={userListItems}
        searchPlaceholder={searchPlaceholder}
      />
      <ClientPackageInfoModal
        ref={modalRef}
        data={modalData}
        onClose={() => {
          // Return focus to the package row that opened the modal.
          if (selected) {
            restoreFocus.requestFocus(
              clientPackageRowFocusId(selected.party.partyUuid, selected.accessPackage.id),
            );
          }
          setSelected(null);
        }}
      />
    </RestoreFocusProvider>
  );
};

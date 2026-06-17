import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  Button,
  type UserListItemProps,
  type Color,
  formatDisplayName,
} from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type {
  AddAgentAccessPackagesFn,
  Agent,
  Client,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { getFormattedDateOfBirthLabel, isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { useRoleMetadata } from '../UserRoles/useRoleMetadata';
import { isNewUser } from '../isNewUser';

import { AccessPackageListItems } from '../AccessPackageListItems/AccessPackageListItems';
import {
  clientPackageActionFocusId,
  clientPackageRowFocusId,
} from '../AccessPackageListItems/clientPackageFocusIds';
import { UserListItems, type UserListItemData } from '../UserListItems/UserListItems';
import { useClientAccessPackageActions } from './useClientAccessPackageActions';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  ClientPackageInfoModal,
  type ClientPackageModalData,
} from '../DelegationModal/AccessPackages/ClientPackageInfoModal';
import { RestoreFocusProvider, useRestoreFocus } from '../RestoreFocus';
import { PartyType } from '@/rtk/features/userInfoApi';

// Tracks an inline delegate/revoke awaiting settle, so focus can be restored to the action button
// once its row's access has flipped (the "Gi"/"Slett" button swapped in place).
interface PendingSwapFocus {
  focusId: string;
  agentId: string;
  packageId: string;
  expectedHasAccess: boolean;
}

type ClientAgentPackageListProps = {
  agents: Agent[];
  clientAccessPackages: Agent[];
  client?: Client;
  isLoading: boolean;
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
  emptyText?: string;
  addUserButton?: React.ReactNode;
};

const getUserListItemType = (agentType: string): UserListItemProps['type'] => {
  return agentType.toLowerCase() === 'person' ? 'person' : 'company';
};

const getAgentSortKey = (agent: Agent): string =>
  `${isNewUser(agent.agentAddedAt) ? '0' : '1'}:${agent.agent.name.toLowerCase()}`;

export const ClientAgentPackageList = ({
  agents,
  clientAccessPackages,
  client,
  isLoading,
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  emptyText,
  addUserButton,
}: ClientAgentPackageListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();
  const isMobileOrSmaller = useIsMobileOrSmaller();

  const delegateDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;
  const removeDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;

  const { addClientAccessPackage, removeClientAccessPackage } = useClientAccessPackageActions({
    fromPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

  const modalRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ClientPackageModalData | null>(null);
  const restoreFocus = useRestoreFocus();
  const [pendingSwapFocus, setPendingSwapFocus] = useState<PendingSwapFocus | null>(null);

  const clientAccess = client?.access ?? [];
  const clientType = client?.client.type ?? '';
  const clientIsSubUnit = isSubUnitByType(client?.client.variant);
  const packageType = clientType.toLowerCase() === 'organisasjon' ? 'company' : 'person';

  const packageIdsByAgentId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (clientAccessPackages ?? []).forEach((agent) => {
      const packageIds = new Set<string>();
      agent.access.forEach((access) => {
        access.packages.forEach((pkg) => {
          packageIds.add(pkg.id);
        });
      });
      map.set(agent.agent.id, packageIds);
    });
    return map;
  }, [clientAccessPackages]);

  const agentHasPackage = (agentId: string, packageId: string) =>
    packageIdsByAgentId.get(agentId)?.has(packageId) ?? false;

  // Once an inline delegate/revoke has settled (the row's access flipped to the expected value and
  // the "Gi"/"Slett" button re-rendered in place), restore focus to that button.
  useEffect(() => {
    if (!pendingSwapFocus) {
      return;
    }
    const hasAccess =
      packageIdsByAgentId.get(pendingSwapFocus.agentId)?.has(pendingSwapFocus.packageId) ?? false;
    if (hasAccess !== pendingSwapFocus.expectedHasAccess) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      restoreFocus.requestFocus(pendingSwapFocus.focusId);
      setPendingSwapFocus(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [packageIdsByAgentId, pendingSwapFocus, restoreFocus]);

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      return getAgentSortKey(a).localeCompare(getAgentSortKey(b));
    });
  }, [agents]);

  const userListItems: UserListItemData[] = sortedAgents.map((agent) => {
    const agentId = agent.agent.id;
    const isRecentlyAdded = isNewUser(agent.agentAddedAt);
    const isSubUnit = isSubUnitByType(agent.agent.variant);
    const userType = getUserListItemType(agent.agent.type);
    const nodes = clientAccess.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const agentName = formatDisplayName({
        fullName: agent.agent.name,
        type: agent.agent.type === 'Person' ? 'person' : 'company',
      });

      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = agentHasPackage(agentId, pkg.id);
        const accessPackage = getAccessPackageById(pkg.id);
        const delegable = accessPackage?.isDelegable ?? false;
        const packageName = accessPackage?.name || pkg.name;
        const roleDescription =
          access.role.code !== 'rettighetshaver'
            ? t('client_administration_page.via_role', { role: roleName })
            : undefined;

        const onDelegate = (onSuccess?: () => void, onError?: () => void) =>
          addClientAccessPackage(
            agentId,
            access.role.code,
            pkg.urn ?? '',
            agentName,
            packageName,
            onSuccess,
            onError,
          );
        const onRevoke = (onSuccess?: () => void, onError?: () => void) =>
          removeClientAccessPackage(
            agentId,
            access.role.code,
            pkg.urn ?? '',
            agentName,
            packageName,
            onSuccess,
            onError,
          );

        const openModal =
          accessPackage && delegable
            ? () => {
                setSelected({
                  party: {
                    partyId: 0,
                    partyUuid: agentId,
                    name: agent.agent.name,
                    orgNumber: agent.agent.organizationIdentifier ?? undefined,
                    partyTypeName:
                      agent.agent.type.toLowerCase() === 'person'
                        ? PartyType.Person
                        : PartyType.Organization,
                    dateOfBirth: agent.agent.dateOfBirth ?? undefined,
                    variant: agent.agent.variant ?? undefined,
                  },
                  accessPackage,
                  userHasAccess: hasAccess,
                  roleDescription,
                  onDelegate,
                  onRevoke,
                });
                modalRef.current?.showModal();
              }
            : undefined;

        const showModalTrigger = !!openModal;
        const rowFocusId = clientPackageRowFocusId(agentId, pkg.id);
        const actionFocusId = clientPackageActionFocusId(rowFocusId);

        return {
          id: rowFocusId,
          name: packageName,
          type: packageType,
          isSubUnit: clientIsSubUnit,
          interactive: showModalTrigger,
          titleAs: 'h3',
          description: roleDescription ?? '',
          as: showModalTrigger ? 'button' : 'div',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          onClick: showModalTrigger ? openModal : undefined,
          controls:
            !isMobileOrSmaller &&
            delegable &&
            (hasAccess ? (
              <Button
                id={actionFocusId}
                variant='tertiary'
                disabled={removeDisabled}
                onClick={() => {
                  setPendingSwapFocus({
                    focusId: actionFocusId,
                    agentId,
                    packageId: pkg.id,
                    expectedHasAccess: false,
                  });
                  onRevoke();
                }}
              >
                <MinusCircleIcon aria-hidden='true' />
                {t('client_administration_page.remove_package_button')}
              </Button>
            ) : (
              <Button
                id={actionFocusId}
                variant='tertiary'
                disabled={delegateDisabled}
                onClick={() => {
                  setPendingSwapFocus({
                    focusId: actionFocusId,
                    agentId,
                    packageId: pkg.id,
                    expectedHasAccess: true,
                  });
                  onDelegate();
                }}
              >
                <PlusCircleIcon aria-hidden='true' />
                {t('client_administration_page.delegate_package_button')}
              </Button>
            )),
        };
      });

      if (packages) {
        acc.push(...packages.filter((pkg): pkg is AccessPackageListItemProps => pkg !== null));
      }

      return acc;
    }, [] as AccessPackageListItemProps[]);

    return {
      id: agentId,
      name: agent.agent.name,
      type: userType,
      subUnit: isSubUnit,
      deleted: agent.agent.isDeleted ?? undefined,
      collapsible: true,
      interactive: true,
      titleAs: 'h2',
      as: 'button',
      children: <AccessPackageListItems items={nodes} />,
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: agent.agent.organizationIdentifier,
            })
          : userType === 'person'
            ? getFormattedDateOfBirthLabel(agent.agent.dateOfBirth)
            : undefined,
      badge: isRecentlyAdded
        ? {
            label: t('client_administration_page.new_agent_tag'),
            color: 'success',
            variant: 'base',
          }
        : undefined,
    };
  });

  // Resolve the selected item's access live from the unfiltered access state, so the modal stays
  // correct after a mutation even when its row leaves the filtered ("has access" / "all") tab.
  const modalData: ClientPackageModalData | undefined = selected
    ? {
        ...selected,
        userHasAccess: agentHasPackage(selected.party.partyUuid, selected.accessPackage.id),
      }
    : undefined;

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <UserListItems
        items={userListItems}
        searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
        addUserButton={addUserButton}
        emptyText={emptyText}
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

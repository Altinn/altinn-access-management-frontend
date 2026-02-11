import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItemProps,
  Button,
  DsParagraph,
  type UserListItemProps,
  type Color,
  formatDate,
} from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import type {
  AddAgentAccessPackagesFn,
  Agent,
  Client,
  RemoveAgentAccessPackagesFn,
} from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { useRoleMetadata } from '../common/UserRoles/useRoleMetadata';
import { AddAgentButton } from '../users/NewUserModal/AddAgentModal';

import { AccessPackageListItems } from '../clientAdministrationAgentDetails/AccessPackageListItems';
import {
  UserListItems,
  type UserListItemData,
} from '../clientAdministrationAgentDetails/UserListItems';
import { useClientAccessPackageActions } from './useClientAccessPackageActions';

type ClientAdministrationClientAgentsListProps = {
  agents: Agent[];
  clientAccessPackages: Agent[];
  client?: Client;
  isLoading: boolean;
  fromPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackagesFn;
  removeAgentAccessPackages: RemoveAgentAccessPackagesFn;
  emptyText?: string;
  onUserAdded?: () => void;
};

const RECENT_AGENT_TIME = 5 * 60 * 1000;

const getUserListItemType = (agentType: string): UserListItemProps['type'] => {
  return agentType.toLowerCase() === 'person' ? 'person' : 'company';
};

const isRecentAgent = (agentAddedAt: string | undefined): boolean => {
  const parsed = Date.parse(agentAddedAt ?? '');
  if (Number.isNaN(parsed)) {
    return false;
  }

  const nowMs = Date.now();

  return nowMs - parsed <= RECENT_AGENT_TIME;
};

export const ClientAdministrationClientAgentsList = ({
  agents,
  clientAccessPackages,
  client,
  isLoading,
  fromPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
  removeAgentAccessPackages,
  emptyText,
  onUserAdded,
}: ClientAdministrationClientAgentsListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const { getRoleMetadata } = useRoleMetadata();

  const delegateDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;
  const removeDisabled = isLoading || !fromPartyUuid || !actingPartyUuid;

  const { addClientAccessPackage, removeClientAccessPackage } = useClientAccessPackageActions({
    fromPartyUuid,
    actingPartyUuid,
    addAgentAccessPackages,
    removeAgentAccessPackages,
  });

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

  const { sortedAgents, recentAgentIds } = useMemo(() => {
    const decoratedAgents = agents.map((agent) => {
      return {
        agent,
        recent: isRecentAgent(agent.agentAddedAt),
      };
    });

    decoratedAgents.sort((a, b) => {
      if (a.recent !== b.recent) {
        return a.recent ? -1 : 1;
      }

      if (a.recent && b.recent) {
        const bAddedAt = Date.parse(b.agent.agentAddedAt ?? '') || 0;
        const aAddedAt = Date.parse(a.agent.agentAddedAt ?? '') || 0;
        const byAddedAt = bAddedAt - aAddedAt;
        if (byAddedAt !== 0) {
          return byAddedAt;
        }
      }

      return a.agent.agent.name.localeCompare(b.agent.agent.name);
    });

    return {
      sortedAgents: decoratedAgents.map(({ agent }) => agent),
      recentAgentIds: new Set(
        decoratedAgents.filter(({ recent }) => recent).map(({ agent }) => agent.agent.id),
      ),
    };
  }, [agents]);

  const userListItems: UserListItemData[] = sortedAgents.map((agent) => {
    const agentId = agent.agent.id;
    const isRecentlyAdded = recentAgentIds.has(agentId);
    const isSubUnit = isSubUnitByType(agent.agent.variant);
    const userType = getUserListItemType(agent.agent.type);

    const nodes = clientAccess.reduce((acc, access) => {
      if (access.packages.length === 0) return acc;

      const roleName = getRoleMetadata(access.role.id)?.name ?? access.role.name;
      const packages = access.packages?.map<AccessPackageListItemProps>((pkg) => {
        const hasAccess = packageIdsByAgentId.get(agentId)?.has(pkg.id) ?? false;
        const accessPackage = getAccessPackageById(pkg.id);
        const delegable = accessPackage?.isDelegable ?? false;
        return {
          id: pkg.id,
          name: accessPackage?.name || pkg.name,
          type: packageType,
          isSubUnit: clientIsSubUnit,
          interactive: false,
          description:
            access.role.code !== 'rettighetshaver'
              ? t('client_administration_page.via_role', { role: roleName })
              : '',
          as: 'div',
          color: (hasAccess ? 'company' : 'neutral') as Color,
          controls:
            delegable &&
            (hasAccess ? (
              <Button
                variant='tertiary'
                disabled={removeDisabled}
                onClick={() => {
                  removeClientAccessPackage(
                    agentId,
                    access.role.code,
                    pkg.urn ?? '',
                    agent.agent.name,
                    accessPackage?.name || pkg.name,
                  );
                }}
              >
                <MinusCircleIcon />
                {t('client_administration_page.remove_package_button')}
              </Button>
            ) : (
              <Button
                variant='tertiary'
                disabled={delegateDisabled}
                onClick={() => {
                  addClientAccessPackage(
                    agentId,
                    access.role.code,
                    pkg.urn ?? '',
                    agent.agent.name,
                    accessPackage?.name || pkg.name,
                  );
                }}
              >
                <PlusCircleIcon />
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
      as: Button,
      children: <AccessPackageListItems items={nodes} />,
      description:
        userType === 'company'
          ? t('client_administration_page.organization_identifier', {
              orgnr: agent.agent.organizationIdentifier,
            })
          : userType === 'person'
            ? `${t('common.date_of_birth')} ${formatDate(agent.agent.dateOfBirth ?? '')}`
            : undefined,
      badge: isRecentlyAdded
        ? {
            label: t('client_administration_page.new_agent_tag'),
          }
        : undefined,
    };
  });

  const hasAgents = userListItems.length > 0;

  return (
    <div>
      {hasAgents ? (
        <UserListItems
          items={userListItems}
          searchPlaceholder={t('client_administration_page.agent_search_placeholder')}
        />
      ) : (
        <DsParagraph>{emptyText ?? t('client_administration_page.no_agents')}</DsParagraph>
      )}
      <div style={{ marginTop: '1rem' }}>
        <AddAgentButton
          onComplete={() => {
            onUserAdded?.();
          }}
        />
      </div>
    </div>
  );
};

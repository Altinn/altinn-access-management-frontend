import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessPackageListItem,
  Button,
  DsHeading,
  DsParagraph,
  List,
  UserListItem,
} from '@altinn/altinn-components';

import type { Client, useAddAgentAccessPackagesMutation } from '@/rtk/features/clientApi';
import { useAccessPackageLookup } from '@/resources/hooks/useAccessPackageLookup';
import { PlusCircleIcon } from '@navikt/aksel-icons';
import classes from './ClientAdministrationAgentClientsList.module.css';

type AddAgentAccessPackages = ReturnType<typeof useAddAgentAccessPackagesMutation>[0];

type ClientAdministrationAgentClientsListProps = {
  clients: Client[];
  isAddingAgentAccessPackages: boolean;
  toPartyUuid?: string;
  actingPartyUuid?: string;
  addAgentAccessPackages: AddAgentAccessPackages;
};
export const ClientAdministrationAgentClientsList = ({
  clients,
  isAddingAgentAccessPackages,
  toPartyUuid,
  actingPartyUuid,
  addAgentAccessPackages,
}: ClientAdministrationAgentClientsListProps) => {
  const { t } = useTranslation();
  const { getAccessPackageById } = useAccessPackageLookup();
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpanded = (clientId: string) => {
    setExpanded((prevExpanded) =>
      prevExpanded.includes(clientId)
        ? prevExpanded.filter((id) => id !== clientId)
        : [...prevExpanded, clientId],
    );
  };

  const addAgentAccessPackageHandler = (clientId: string, roleCode: string, packageId: string) => {
    if (!toPartyUuid || !actingPartyUuid) {
      return;
    }

    addAgentAccessPackages({
      from: clientId,
      to: toPartyUuid,
      party: actingPartyUuid,
      payload: {
        values: [
          {
            role: roleCode,
            packages: [packageId],
          },
        ],
      },
    });
  };

  return (
    <List>
      {clients.map((client) => {
        return (
          <UserListItem
            as={Button}
            key={client.client.id}
            id={client.client.id}
            name={client.client.name}
            type={client.client.type ? 'company' : 'person'}
            expanded={expanded.includes(client.client.id)}
            collapsible
            onClick={() => toggleExpanded(client.client.id)}
          >
            {client.access.length === 0 && (
              <DsParagraph data-size='sm'>
                {t('client_administration_page.no_delegations')}
              </DsParagraph>
            )}
            {client.access.length > 0 && (
              <List>
                {client.access.map((access) => {
                  {
                    access.packages.length === 0 && (
                      <li
                        key={`${client.client.id}-${access.role.id}`}
                        className={classes.accessRoleItem}
                      >
                        <DsHeading>{access.role.code}</DsHeading>
                        <DsParagraph data-size='sm'>
                          {t('client_administration_page.no_delegations')}
                        </DsParagraph>
                      </li>
                    );
                  }
                  if (access.packages.length > 0)
                    return (
                      <li
                        key={`${client.client.id}-${access.role.id}`}
                        className={classes.accessRoleItem}
                      >
                        <DsHeading>{access.role.code}</DsHeading>
                        {access.packages.length === 0 && (
                          <DsParagraph data-size='sm'>
                            {t('client_administration_page.no_delegations')}
                          </DsParagraph>
                        )}
                        {access.packages.length > 0 && (
                          <div className={classes.poaList}>
                            <List>
                              {access.packages.map((pkg) => {
                                const accessPackage = getAccessPackageById(pkg.id);
                                return (
                                  <AccessPackageListItem
                                    key={`${client.client.id}-${access.role.id}-${pkg.id}`}
                                    id={accessPackage?.id ?? pkg.id}
                                    size='md'
                                    name={accessPackage?.name ?? pkg.name}
                                    controls={
                                      <Button
                                        variant='tertiary'
                                        disabled={
                                          isAddingAgentAccessPackages ||
                                          !toPartyUuid ||
                                          !actingPartyUuid
                                        }
                                        onClick={() => {
                                          addAgentAccessPackageHandler(
                                            client.client.id,
                                            access.role.code,
                                            pkg.urn ?? pkg.id,
                                          );
                                        }}
                                      >
                                        <PlusCircleIcon />
                                        {t('client_administration_page.delegate_package_button')}
                                      </Button>
                                    }
                                  ></AccessPackageListItem>
                                );
                              })}
                            </List>
                          </div>
                        )}
                      </li>
                    );
                })}
              </List>
            )}
          </UserListItem>
        );
      })}
    </List>
  );
};

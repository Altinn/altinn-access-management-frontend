import React from 'react';
import { useNewActorList } from '@/resources/utils/featureFlagUtils';
import {
  ReporteeInfo,
  useGetFavoriteActorUuidsQuery,
  useGetReporteeQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { AccountMenuItemProps, MenuGroupProps } from '@altinn/altinn-components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Connection } from '@/rtk/features/connectionApi';

export interface useAccountProps {
  reporteeList?: ReporteeInfo[];
  actorList?: Connection[];
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

const getAccountTypeFromConnection = (type: string): 'company' | 'person' => {
  return type === 'Organisasjon' ? 'company' : 'person';
};

export const useAccounts = ({ reporteeList, actorList }: useAccountProps) => {
  const { t } = useTranslation();
  const { data: actingParty } = useGetReporteeQuery();
  const { data: currentUser } = useGetUserInfoQuery();
  const { data: favoriteUuids } = useGetFavoriteActorUuidsQuery();

  const useNewActorListFlag = useNewActorList();

  const [accounts, accountGroups]: [AccountMenuItemProps[], Record<string, MenuGroupProps>] =
    useMemo(() => {
      if ((!reporteeList && !actorList) || !currentUser || !actingParty) {
        return [[], {}];
      }

      const accountList = [];
      if (useNewActorListFlag && actorList) {
        for (const account of actorList ?? []) {
          const mappedAccount = getAccountFromConnection(
            account,
            currentUser.uuid,
            actingParty.partyUuid,
            t('common.org_no'),
            t('common.part_of'),
            t('common.date_of_birth'),
          );
          accountList.push(mappedAccount);
          if (favoriteUuids?.includes(account.party.id)) {
            const favoriteAccount = { ...mappedAccount, groupId: 'favorites' };
            accountList.push(favoriteAccount);
          }
        }
      } else if (reporteeList) {
        for (const account of reporteeList ?? []) {
          const mappedAccount = getAccount(
            account,
            currentUser.uuid,
            actingParty.partyUuid,
            t('common.org_no'),
            t('common.part_of'),
          );
          accountList.push(mappedAccount);

          if (favoriteUuids?.includes(account.partyUuid)) {
            const favoriteAccount = { ...mappedAccount, groupId: 'favorites' };
            accountList.push(favoriteAccount);
          }

          if (account.subunits && account.subunits.length > 0) {
            for (const subUnit of account.subunits) {
              const parent = account;
              const mappedSubUnit = getAccount(
                subUnit,
                currentUser.uuid,
                actingParty.partyUuid,
                t('common.org_no'),
                t('common.part_of'),
                parent,
              );
              accountList.push(mappedSubUnit);
              if (favoriteUuids?.includes(subUnit.partyUuid)) {
                const favoriteAccount = { ...mappedSubUnit, groupId: 'favorites' };
                accountList.push(favoriteAccount);
              }
            }
          }
        }
      }

      const sortedAccounts =
        accountList.sort((a, b) => {
          if (a.groupId === 'self') return -1;
          if (b.groupId === 'self') return 1;
          if (a.type === 'company' && b.type === 'person') return 1;
          if (b.type === 'company' && a.type === 'person') return -1;
          if (b.groupId !== 'self' && a.groupId === 'favorites') return -1;
          if (a.groupId !== 'self' && b.groupId === 'favorites') return 1;
          return a.name > b.name ? 1 : -1;
        }) ?? [];

      const firstCompany = sortedAccounts.find(
        (a) => a.type === 'company' && a.groupId !== 'favorites',
      );

      const firstPerson = sortedAccounts.find(
        (a) => a.type === 'person' && a.groupId !== 'favorites' && a.groupId !== 'self',
      );

      const accountGroups: Record<string, MenuGroupProps> = {
        self: {
          title: t('header.account_you'),
          divider: true,
        },
        [firstCompany?.groupId || 'company']: {
          title: t('header.account_orgs'),
          divider: true,
        },
        [firstPerson?.groupId || 'person']: {
          title: t('header.account_persons'),
          divider: true,
        },
        favorites: {
          title: t('header.account_favorites'),
          divider: true,
        },
      };
      return [sortedAccounts, accountGroups];
    }, [reporteeList, actorList, currentUser, actingParty]);

  return { accounts, accountGroups, favoriteUuids, actingParty, currentUser };
};

const getAccount = (
  reportee: ReporteeInfo,
  userUuid: string,
  currentReporteeUuid: string,
  orgNumberText: string,
  partOfText: string,
  parent?: ReporteeInfo,
): AccountMenuItemProps => {
  const lastToFirstName = (name: string) => {
    const nameParts = name.split(' ');
    return `${nameParts[nameParts.length - 1]} ${nameParts.slice(0, -1).join(' ')}`;
  };
  const name = reportee.type === 'Person' ? lastToFirstName(reportee.name) : reportee.name;
  const isSubUnit = reportee.type === 'Organization' && !!parent;
  const group =
    reportee.partyUuid === userUuid ? 'self' : isSubUnit ? parent?.partyUuid : reportee.partyUuid;
  const description = isSubUnit
    ? `↪ ${orgNumberText}: ${reportee.organizationNumber}, ${partOfText} ${parent?.name}`
    : reportee.type === 'Organization'
      ? `${orgNumberText}: ${reportee.organizationNumber}`
      : '';
  const accountType = getAccountType(reportee?.type ?? '');
  return {
    id: reportee.partyId,
    icon: {
      name: name,
      type: accountType,
      variant: isSubUnit ? 'outline' : 'solid',
    },
    name: name,
    description: description,
    groupId: group,
    type: accountType,
    selected: reportee.partyUuid === currentReporteeUuid,
    disabled: reportee.onlyHierarchyElementWithNoAccess ? true : false,
  };
};

const getAccountFromConnection = (
  actorConnection: Connection,
  userUuid: string,
  currentReporteeUuid: string,
  orgNumberText: string,
  partOfText: string,
  dateOfBirthText?: string,
): AccountMenuItemProps => {
  const accountType = getAccountTypeFromConnection(actorConnection?.party.type ?? '');
  const isSubUnit = actorConnection.party.type === 'Organisasjon' && !!actorConnection.party.parent;
  const group =
    actorConnection.party.id === userUuid
      ? 'self'
      : isSubUnit
        ? actorConnection.party.parent?.id
        : actorConnection.party.id;
  const description = isSubUnit
    ? `↪ ${orgNumberText}: ${actorConnection.party.keyValues?.OrganizationIdentifier}, ${partOfText} ${actorConnection.party.parent?.name}`
    : actorConnection.party.type === 'Organisasjon'
      ? `${orgNumberText}: ${actorConnection.party.keyValues?.OrganizationIdentifier}`
      : `${dateOfBirthText}: ${actorConnection.party.keyValues?.DateOfBirth}`;

  return {
    id: actorConnection.party.keyValues?.PartyId ?? actorConnection.party.id,
    icon: {
      name: actorConnection.party.name,
      type: accountType,
      variant: isSubUnit ? 'outline' : 'solid',
    },
    name: actorConnection.party.name,
    description: description,
    groupId: group,
    type: accountType,
    selected: actorConnection.party.id === currentReporteeUuid,
  };
};

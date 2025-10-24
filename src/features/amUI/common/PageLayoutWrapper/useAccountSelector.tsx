import { AccountMenuItemProps, formatDisplayName, MenuGroupProps } from '@altinn/altinn-components';
import { AccountSelectorProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader/AccountSelector';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface AuthorizedParty {
  partyUuid: string;
  name: string;
  organizationNumber?: string;
  partyId: string;
  type?: string;
  unitType?: string;
  isDeleted: boolean;
  onlyHierarchyElementWithNoAccess: boolean;
  authorizedResources: string[];
  authorizedRoles: string[];
  subunits?: AuthorizedParty[];
}

export interface useAccountSelectorProps {
  partyListDTO?: AuthorizedParty[];
  favoriteAccountUuids?: string[];
  currentAccountUuid?: string;
  selfAccountUuid?: string;
  isLoading?: boolean;
  isVirtualized?: boolean;
  onSelectAccount?: (accountId: string) => void;
}

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const useAccountSelector = ({
  partyListDTO,
  favoriteAccountUuids,
  currentAccountUuid,
  selfAccountUuid,
  isLoading,
  onSelectAccount,
  isVirtualized = false,
}: useAccountSelectorProps): AccountSelectorProps => {
  const { t } = useTranslation();

  const [accounts, accountGroups, currentAccount]: [
    AccountMenuItemProps[],
    Record<string, MenuGroupProps>,
    AccountMenuItemProps | undefined,
  ] = useMemo(() => {
    if (isLoading || !partyListDTO || !selfAccountUuid) {
      return [[], {}, undefined];
    }
    const self = partyListDTO.find(
      (party) => isPersonType(party.type) && party.partyUuid === selfAccountUuid,
    );

    const favorites = partyListDTO.filter((party) =>
      favoriteAccountUuids?.includes(party.partyUuid),
    );

    const otherPeople = partyListDTO.filter(
      (party) => isPersonType(party.type) && party.partyUuid !== selfAccountUuid,
    );

    const organizations = partyListDTO.filter((party) => isOrgType(party.type));

    const selfAccountItem = getAccountFromAuthorizedParty(self!, 'favorites', currentAccountUuid);
    const favoriteAccountItems = favorites?.map((party) =>
      getAccountFromAuthorizedParty(party, 'favorites', currentAccountUuid),
    );
    const peopleAccountItems = otherPeople?.map((party) =>
      getAccountFromAuthorizedParty(party, party.partyUuid, currentAccountUuid),
    );

    let organizationAccountItems: AccountMenuItemProps[] = [];
    for (const org of organizations) {
      const orgAccountItem = getAccountFromAuthorizedParty(org, org.partyUuid, currentAccountUuid);
      organizationAccountItems.push(orgAccountItem);
      if (org.subunits && org.subunits.length > 0) {
        for (const subUnit of org.subunits) {
          const subUnitAccountItem = getAccountFromAuthorizedParty(
            subUnit,
            org.partyUuid,
            currentAccountUuid!,
            org,
          );
          organizationAccountItems.push(subUnitAccountItem);
        }
      }
    }

    const allAccounts = [
      selfAccountItem,
      ...favoriteAccountItems,
      ...peopleAccountItems,
      ...organizationAccountItems,
    ];

    const currentAccountListItem = allAccounts.find((account) => account.selected === true);

    const accountGroups: Record<string, MenuGroupProps> = {
      [organizationAccountItems[0]?.groupId || 'company']: {
        title: t('header.account_orgs'),
        divider: true,
      },
      [peopleAccountItems[0]?.groupId || 'person']: {
        title: t('header.account_persons'),
        divider: true,
      },
      favorites: {
        title: t('header.account_favorites'),
        divider: true,
      },
    };

    return [allAccounts, accountGroups, currentAccountListItem];
  }, [partyListDTO, selfAccountUuid, favoriteAccountUuids, currentAccountUuid, t, isLoading]);

  if (isLoading || !partyListDTO || !selfAccountUuid) {
    return {
      accountMenu: {
        items: [],
        groups: {},
        isVirtualized: isVirtualized,
        onSelectAccount: () => {},
        currentAccount: undefined,
      },
      loading: isLoading,
    };
  }

  return {
    accountMenu: {
      items: accounts,
      groups: accountGroups,
      isVirtualized: isVirtualized,
      onSelectAccount: onSelectAccount,
      currentAccount: currentAccount,
    },
    loading: false,
  };
};

const getAccountFromAuthorizedParty = (
  party: AuthorizedParty,
  group: string,
  currentAccountUuid?: string,
  parent?: AuthorizedParty,
): AccountMenuItemProps => {
  let type: 'company' | 'person' = getAccountType(party.type ?? '');

  let name = formatDisplayName({
    fullName: party.name,
    type: type,
    reverseNameOrder: type === 'person',
  });
  let parentName = parent
    ? formatDisplayName({
        fullName: parent.name,
        type: getAccountType(parent.type ?? ''),
        reverseNameOrder: false,
      })
    : undefined;
  let description = '';

  const formatType = type === 'company' && !!parent ? 'subUnit' : type;
  switch (formatType) {
    case 'company':
      description = `Org.nr: ${party.organizationNumber}`;
      break;
    case 'person':
      // Birth date when available will be added here
      break;
    case 'subUnit':
      description = `↳ Org.nr: ${party.organizationNumber}, del av ${parentName}`;
      break;
  }
  return {
    id: party.partyId,
    icon: {
      name: name,
      type: type,
      isParent: !parent,
      isDeleted: party.isDeleted,
      colorKey: parentName ?? undefined,
    },
    name: name,
    description: description,
    groupId: group,
    type: type,
    selected: currentAccountUuid === party.partyUuid,
    disabled: party.onlyHierarchyElementWithNoAccess ? true : false,
  };
};

const isOrgType = (type?: string) => {
  return type === 'Organization';
};

const isPersonType = (type?: string) => {
  return type === 'Person';
};

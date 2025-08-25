import { useCallback, useMemo, useState, useEffect } from 'react';
import pageClasses from './PackagePoaDetailsPage.module.css';
import headerClasses from './PackagePoaDetailsHeader.module.css';
import { DsSearch, DsTabs, List, ResourceListItem } from '@altinn/altinn-components';
import { useParams } from 'react-router';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetPackagePermissionDetailsQuery } from '@/rtk/features/accessPackageApi';
import { useTranslation } from 'react-i18next';
import { type Connection, type User } from '@/rtk/features/userInfoApi';
import { UserList } from '../common/UserList/UserList';
import { debounce } from '@/resources/utils/debounce';
import { PackagePoaDetailsHeader } from './PackagePoaDetailsHeader';
import { useResourceList } from '../common/DelegationModal/AccessPackages/useResourceList';

export const PackagePoaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { fromParty, actingParty } = usePartyRepresentation();
  const [searchString, setSearchString] = useState<string>('');

  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  useEffect(() => {
    return () => {
      (onSearch as any).cancel?.();
    };
  }, [onSearch]);

  const { data: accessPackage, isLoading } = useGetPackagePermissionDetailsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      packageId: id || '',
    },
    { skip: !id || !fromParty?.partyUuid },
  );

  const connections: Connection[] = useMemo(() => {
    const group: Record<string, Connection> = {};
    for (const { to, role } of accessPackage?.permissions ?? []) {
      if (!group[to.id]) {
        const party: User = {
          id: to.id,
          name: to.name,
          type: to.type,
          variant: to.variant,
          children: null,
          keyValues: to.keyValues,
        };
        group[to.id] = { party, roles: [], connections: [] };
      }
      const entry = group[to.id];
      [role].forEach((r) => {
        if (r && !entry.roles.some((er) => er.code === r.code)) {
          entry.roles.push({ id: r.id, code: r.code });
        }
      });
    }
    return Object.values(group);
  }, [accessPackage?.permissions]);

  const [chosenTab, setChosenTab] = useState('users');

  return (
    <>
      <div className={headerClasses.headingContainer}>
        <PackagePoaDetailsHeader
          isLoading={isLoading}
          packageName={accessPackage?.name}
          packageDescription={accessPackage?.description}
          fromPartyName={fromParty?.name}
          fromPartyTypeName={fromParty?.partyTypeName}
        />
      </div>
      <DsTabs
        defaultValue='users'
        data-size='sm'
        value={chosenTab}
        onChange={setChosenTab}
      >
        <DsTabs.List>
          <DsTabs.Tab value='users'>{t('package_poa_details_page.users_tab_title')}</DsTabs.Tab>
          <DsTabs.Tab value='services'>
            {t('package_poa_details_page.services_tab_title')}
          </DsTabs.Tab>
        </DsTabs.List>
        <DsTabs.Panel
          className={pageClasses.tabContent}
          value='users'
        >
          <DsSearch className={pageClasses.searchBar}>
            <DsSearch.Input
              aria-label={t('users_page.user_search_placeholder')}
              placeholder={t('users_page.user_search_placeholder')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSearch(event.target.value)
              }
            />
            <DsSearch.Clear
              onClick={() => {
                onSearch.cancel?.();
                setSearchString('');
              }}
            />
          </DsSearch>

          <UserList
            connections={connections}
            searchString={searchString}
            showRoles
            listItemTitleAs='h3'
            isLoading={isLoading}
            interactive={false}
            disableLinks
            canAdd={false}
          />
        </DsTabs.Panel>
        <DsTabs.Panel
          className={pageClasses.tabContent}
          value='services'
        >
          {resourceList}
        </DsTabs.Panel>
      </DsTabs>
    </>
  );
};

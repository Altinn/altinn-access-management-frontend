import { getHostUrl, getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import { GeneralPath, ConsentPath, SystemUserPath } from '@/routes/paths';
import { formatDisplayName, HeaderProps, useAccountSelector } from '@altinn/altinn-components';
import { AccountSelectorProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader/AccountSelector';
import { GlobalSearchProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader/GlobalSearch';
import { useGlobalMenu } from './useGlobalMenu';
import { useTranslation } from 'react-i18next';
import { useNewActorList, useNewHeader } from '@/resources/utils/featureFlagUtils';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import {
  useGetReporteeQuery,
  useGetUserInfoQuery,
  useGetReporteeListForAuthorizedUserQuery,
  useGetActorListForAuthorizedUserQuery,
  useGetFavoriteActorUuidsQuery,
  useAddFavoriteActorUuidMutation,
  useRemoveFavoriteActorUuidMutation,
} from '@/rtk/features/userInfoApi';
import { GlobalHeaderProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader';
import { useAccounts } from './useAccounts';
import { ChangeEvent, useState } from 'react';

const getAccountType = (type: string): 'company' | 'person' => {
  return type === 'Organization' ? 'company' : 'person';
};

export const useHeader = () => {
  const { t, i18n } = useTranslation();
  const useNewHeaderFlag = useNewHeader();
  const [searchString, setSearchString] = useState<string>('');

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: userinfo } = useGetUserInfoQuery();
  const { data: reporteeList, isLoading: isLoadingReporteeList } =
    useGetReporteeListForAuthorizedUserQuery(undefined);
  const { data: favoriteAccountUuids, isLoading: isLoadingFavoriteAccounts } =
    useGetFavoriteActorUuidsQuery();
  const [addFavoriteActorUuid] = useAddFavoriteActorUuidMutation();
  const [removeFavoriteActorUuid] = useRemoveFavoriteActorUuidMutation();

  const { globalMenu, desktopMenu, mobileMenu, menuGroups, isLoadingMenu } = useGlobalMenu();

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
  };

  // TODO: Add optimistic updates and error handling
  const onToggleFavorite = (accountId: string) => {
    if (favoriteAccountUuids?.includes(accountId)) {
      removeFavoriteActorUuid(accountId);
    } else {
      addFavoriteActorUuid(accountId);
    }
  };

  const languageFromi18n = i18n.language;
  const languageCode =
    languageFromi18n === 'no_nn' ? 'nn' : languageFromi18n === 'en' ? 'en' : 'nb';

  let header: GlobalHeaderProps | HeaderProps;

  // For new header
  const accountSelectorData = useAccountSelector({
    languageCode: languageCode,
    partyListDTO: reporteeList ?? [],
    favoriteAccountUuids: favoriteAccountUuids ?? [],
    currentAccountUuid: reportee?.partyUuid,
    selfAccountUuid: userinfo?.uuid,
    isVirtualized: reporteeList && reporteeList.length > 20,
    isLoading: isLoadingReporteeList || isLoadingReportee || isLoadingFavoriteAccounts,

    onToggleFavorite: onToggleFavorite,

    onSelectAccount: (accountId: string) => {
      // check if this is a person; then redirect to consents page
      let redirectUrl = window.location.href;
      const isPersonAccount =
        reporteeList?.find((a) => a.partyUuid === accountId)?.type === 'person';
      if (isPersonAccount) {
        redirectUrl = new URL(
          `${window.location.origin}${GeneralPath.BasePath}/${ConsentPath.Consent}/${ConsentPath.Active}`,
        ).toString();
      } else if (window.location.pathname.includes(`/${SystemUserPath.SystemUser}`)) {
        redirectUrl = new URL(
          `${window.location.origin}${GeneralPath.BasePath}/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
        ).toString();
      }

      const changeUrl = new URL(`${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/`);
      changeUrl.searchParams.set('P', accountId);
      changeUrl.searchParams.set('goTo', redirectUrl);
      (window as Window).open(changeUrl.toString(), '_self');
    },
  });

  // For old header
  const { accounts, accountGroups } = useAccounts({ reporteeList });

  if (useNewHeaderFlag) {
    const search: GlobalSearchProps = {
      onSearch: (value: string) => {
        const encodedValue = encodeURIComponent(value);
        window.location.href = `${getHostUrl()}sok?q=${encodedValue}`;
      },
    };

    const accountSelector: AccountSelectorProps = {
      ...accountSelectorData,
      forceOpenFullScreen: false,
    };

    header = {
      locale: {
        title: t('header.locale_title'),
        options: [
          { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
          { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
          { label: 'English', value: 'en', checked: i18n.language === 'en' },
        ],
        onSelect: onChangeLocale,
      },
      logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
      globalMenu: globalMenu,
      desktopMenu: desktopMenu,
      mobileMenu: mobileMenu,
      globalSearch: search,
      accountSelector: accountSelector,
    };
  } else {
    const accountMenu = {
      items: accounts,
      groups: accountGroups,
      search: {
        name: 'account-search',
        value: searchString,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          setSearchString(event.target.value);
        },
        placeholder: t('header.search-label'),
        hidden: false,
        getResultsLabel: (hits: number) => {
          return `${hits} ${t('header.search-hits')}`;
        },
      },
      isVirtualized: true,
    };

    const onSelectAccount = (accountId: string) => {
      // check if this is a person; then redirect to consents page
      let redirectUrl = window.location.href;
      const isPersonAccount = accounts.find((a) => a.id === accountId)?.type === 'person';
      if (isPersonAccount) {
        redirectUrl = new URL(
          `${window.location.origin}${GeneralPath.BasePath}/${ConsentPath.Consent}/${ConsentPath.Active}`,
        ).toString();
      } else if (window.location.pathname.includes(`/${SystemUserPath.SystemUser}`)) {
        redirectUrl = new URL(
          `${window.location.origin}${GeneralPath.BasePath}/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`,
        ).toString();
      }

      const changeUrl = new URL(`${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/`);
      changeUrl.searchParams.set('R', accountId);
      changeUrl.searchParams.set('goTo', redirectUrl);
      (window as Window).open(changeUrl.toString(), '_self');
    };

    const globalMenuOld = { ...globalMenu, onSelectAccount, accountMenu };

    const currentAccountName = formatDisplayName({
      fullName: reportee?.name || '',
      type: reportee?.type === 'Person' ? 'person' : 'company',
      reverseNameOrder: reportee?.type === 'Person' ? true : false,
    });

    header = {
      locale: {
        title: t('header.locale_title'),
        options: [
          { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
          { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
          { label: 'English', value: 'en', checked: i18n.language === 'en' },
        ],
        onSelect: onChangeLocale,
      },
      logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
      currentAccount: {
        name: currentAccountName,
        type: getAccountType(reportee?.type ?? ''),
        id: reportee?.partyId || '',
        icon: { name: currentAccountName, type: getAccountType(reportee?.type ?? '') },
      },
      globalMenu: globalMenuOld,
      desktopMenu: desktopMenu,
      mobileMenu: mobileMenu,
    };
  }

  return { header, languageCode };
};

import { getHostUrl, getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import { GeneralPath } from '@/routes/paths';
import { HeaderProps, useAccountSelector } from '@altinn/altinn-components';
import { AccountSelectorProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader/AccountSelector';
import { GlobalSearchProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader/GlobalSearch';
import { useGlobalMenu } from './useGlobalMenu';
import { useTranslation } from 'react-i18next';
import {
  useGetReporteeQuery,
  useGetUserProfileQuery,
  useGetReporteeListForAuthorizedUserQuery,
  useGetFavoriteActorUuidsQuery,
  useAddFavoriteActorUuidMutation,
  useRemoveFavoriteActorUuidMutation,
  useUpdateShowDeletedMutation,
} from '@/rtk/features/userInfoApi';
import { GlobalHeaderProps } from '@altinn/altinn-components/dist/types/lib/components/GlobalHeader';
import { useEffect, useState } from 'react';
import { useUpdateSelectedLanguageMutation } from '@/rtk/features/settingsApi';
import { displayDeletedAccountToggle } from '@/resources/utils/featureFlagUtils';

export const handleSelectAccount = (accountUuid: string) => {
  // always redirect to start-page when changing account
  const redirectUrl = new URL(`${window.location.origin}${GeneralPath.BasePath}`).toString();
  const changeUrl = new URL(`${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/`);
  const queryKey = 'P';
  changeUrl.searchParams.set(queryKey, accountUuid);
  changeUrl.searchParams.set('goTo', redirectUrl);
  (window as Window).open(changeUrl.toString(), '_self');
};

export const useHeader = ({
  openAccountMenu = false,
  hideAccountSelector = false,
}: {
  openAccountMenu?: boolean;
  hideAccountSelector?: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const [shouldOpenAccountMenu, setShouldOpenAccountMenu] = useState<boolean>(openAccountMenu);
  const [shouldShowDeletedUnits, setShouldShowDeletedUnits] = useState<boolean | undefined>(
    undefined,
  );

  const { data: reportee, isLoading: isLoadingReportee } = useGetReporteeQuery();
  const { data: userProfile, isLoading: isLoadingUserProfile } = useGetUserProfileQuery();
  const { data: reporteeList, isLoading: isLoadingReporteeList } =
    useGetReporteeListForAuthorizedUserQuery(undefined, { skip: hideAccountSelector });
  const { data: favoriteAccountUuids, isLoading: isLoadingFavoriteAccounts } =
    useGetFavoriteActorUuidsQuery();
  const [addFavoriteActorUuid] = useAddFavoriteActorUuidMutation();
  const [removeFavoriteActorUuid] = useRemoveFavoriteActorUuidMutation();
  const [updateShowDeleted] = useUpdateShowDeletedMutation();

  const { globalMenu, desktopMenu, mobileMenu } = useGlobalMenu();
  const [updateSelectedLanguage] = useUpdateSelectedLanguageMutation();

  useEffect(() => {
    if (openAccountMenu) {
      setShouldOpenAccountMenu(true);
    }
  }, [openAccountMenu]);

  useEffect(() => {
    if (!isLoadingReporteeList && reporteeList && reporteeList.length === 1) {
      setShouldOpenAccountMenu(false);
    } else if (
      !isLoadingUserProfile &&
      userProfile?.profileSettingPreference?.preselectedPartyUuid &&
      userProfile?.profileSettingPreference?.preselectedPartyUuid.length > 0
    ) {
      setShouldOpenAccountMenu(false);
    }
  }, [isLoadingReporteeList, reporteeList, isLoadingUserProfile, userProfile]);

  useEffect(() => {
    if (
      displayDeletedAccountToggle() &&
      !isLoadingUserProfile &&
      userProfile?.profileSettingPreference?.shouldShowDeletedEntities !== undefined
    ) {
      setShouldShowDeletedUnits(userProfile?.profileSettingPreference?.shouldShowDeletedEntities);
    }
  }, [isLoadingUserProfile, userProfile]);

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
    updateSelectedLanguage(newLocale);
  };

  // TODO: Add optimistic updates and error handling
  const onToggleFavorite = (accountId: string) => {
    if (favoriteAccountUuids?.includes(accountId)) {
      removeFavoriteActorUuid(accountId);
    } else {
      addFavoriteActorUuid(accountId);
    }
  };

  const onShowDeletedUnitsChange = (shouldShowDeleted: boolean) => {
    updateShowDeleted(shouldShowDeleted)
      .unwrap()
      .then((response) => {
        setShouldShowDeletedUnits(response.shouldShowDeletedEntities);
      });
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
    selfAccountUuid: userProfile?.uuid,
    virtualized: reporteeList && reporteeList.length > 20,
    isLoading:
      !reporteeList ||
      isLoadingReporteeList ||
      isLoadingReportee ||
      isLoadingFavoriteAccounts ||
      hideAccountSelector,
    showDeletedUnits: shouldShowDeletedUnits ?? undefined,

    onToggleFavorite: onToggleFavorite,
    onShowDeletedUnitsChange: onShowDeletedUnitsChange,

    onSelectAccount: (accountId: string) => {
      if (accountId !== reportee?.partyUuid) {
        handleSelectAccount(accountId);
      }
      setShouldOpenAccountMenu(false);
    },
  });

  const search: GlobalSearchProps = {
    onSearch: (value: string) => {
      const encodedValue = encodeURIComponent(value);
      window.location.href = `${getHostUrl()}sok?q=${encodedValue}`;
    },
  };

  const accountSelector: AccountSelectorProps = {
    ...accountSelectorData,
    forceOpenFullScreen: shouldOpenAccountMenu,
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
    logo: { href: getAltinnStartPageUrl(i18n.language), title: 'Altinn' },
    globalMenu: globalMenu,
    desktopMenu: desktopMenu,
    mobileMenu: mobileMenu,
    globalSearch: search,
    accountSelector: accountSelector,
  };
  return { header, languageCode };
};

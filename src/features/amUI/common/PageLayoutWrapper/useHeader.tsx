import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import type {
  HeaderProps,
  AccountSelectorProps,
  GlobalHeaderProps,
} from '@altinn/altinn-components';
import { useAccountSelector } from '@altinn/altinn-components';
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
import { useEffect, useState } from 'react';
import { useUpdateSelectedLanguageMutation } from '@/rtk/features/settingsApi';
import { displayDeletedAccountToggle } from '@/resources/utils/featureFlagUtils';
import {
  redirectToChangeReporteeAndRedirect,
  getDefaultChangeReporteeRedirectTarget,
} from '@/resources/utils/changeReporteeUtils';

export const handleSelectAccount = (
  accountUuid: string,
  goTo = getDefaultChangeReporteeRedirectTarget(),
) => {
  redirectToChangeReporteeAndRedirect(accountUuid, goTo);
};

export const useHeader = ({
  openAccountMenu = false,
  hideAccountSelector = false,
  hideSidebarItems = false,
}: {
  openAccountMenu?: boolean;
  hideAccountSelector?: boolean;
  hideSidebarItems?: boolean;
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

  const { globalMenu, desktopMenu, mobileMenu } = useGlobalMenu({ hideSidebarItems });
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
    accountSelector: accountSelector,
  };
  return { header, languageCode };
};

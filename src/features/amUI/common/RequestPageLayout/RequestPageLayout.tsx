import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { DsSpinner, formatDisplayName, Layout, RootProvider } from '@altinn/altinn-components';
import { getAltinnStartPageUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
import { useUpdateSelectedLanguageMutation } from '@/rtk/features/settingsApi';
import classes from './RequestPageLayout.module.css';

import { useGetUserProfileQuery } from '@/rtk/features/userInfoApi';

interface RequestPageLayoutProps {
  account: { name: string; type: 'person' | 'company' };
  isLoading: boolean;
  error?: React.ReactNode;
  heading?: React.ReactNode;
  body?: React.ReactNode;
}

export const RequestPageLayout = ({
  account,
  isLoading,
  error,
  heading,
  body,
}: RequestPageLayoutProps) => {
  const { t, i18n } = useTranslation();
  const [updateSelectedLanguage] = useUpdateSelectedLanguageMutation();

  const { data: userData } = useGetUserProfileQuery();

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
    updateSelectedLanguage(newLocale);
  };

  return (
    <RootProvider>
      <Layout
        color={account.type === 'person' ? 'person' : 'company'}
        theme='subtle'
        header={{
          locale: {
            title: t('header.locale_title'),
            options: [
              { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
              { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
              { label: 'English', value: 'en', checked: i18n.language === 'en' },
            ],
            onSelect: onChangeLocale,
          },
          logo: {
            href: getAltinnStartPageUrl(i18n.language),
            title: 'Altinn',
          },
          currentAccount: {
            ...account,
            id: '',
            icon: account,
          },
          globalMenu: {
            logoutButton: {
              label: t('header.log_out'),
              onClick: () => {
                const logoutUrl = getLogoutUrl();
                window.location.assign(logoutUrl);
              },
            },
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            menu: {
              items: [{ groupId: 'current-user', hidden: true }],
              groups: {
                'current-user': {
                  title: t('header.logged_in_as_name', {
                    name: formatDisplayName({
                      fullName: userData?.name || '',
                      type: 'person',
                      reverseNameOrder: true,
                    }),
                  }),
                },
              },
            },
          },
        }}
      >
        {isLoading && <LoadingState />}
        {error && <div className={classes.centerBlock}>{error}</div>}
        {heading && body && (
          <div className={classes.centerBlock}>
            <div className={cn(classes.requestBlock, classes.headerBlock)}>{heading}</div>
            <div className={classes.requestBlock}>{body}</div>
          </div>
        )}
      </Layout>
    </RootProvider>
  );
};

const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className={classes.centerBlock}>
      <DsSpinner
        aria-label={t('draft_request_page.loading_request')}
        data-size='lg'
      />
    </div>
  );
};

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { DsSpinner, formatDisplayName, Layout, RootProvider } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useGetConsentRequestQuery } from '@/rtk/features/consentApi';
import { getAltinnStartPageUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
import { useGetUserProfileQuery } from '@/rtk/features/userInfoApi';
import { useUpdateSelectedLanguageMutation } from '@/rtk/features/settingsApi';

import type { ConsentRequest, ProblemDetail } from '../types';
import { getLanguage, replaceStaticMetadata } from '../utils';
import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';
import { ConsentRequestContent } from './ConsentRequestContent';

export const ConsentRequestPage = () => {
  const { t, i18n } = useTranslation();
  const [updateSelectedLanguage] = useUpdateSelectedLanguageMutation();

  useDocumentTitle(t('consent_request.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';
  const language = getLanguage(i18n.language);

  const { data: userData } = useGetUserProfileQuery();

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetConsentRequestQuery(
    { requestId: requestId },
    {
      skip: !requestId,
    },
  );

  const memoizedRequest = useMemo(() => {
    return request
      ? replaceStaticMetadata<ConsentRequest>(request, [
          'title',
          'heading',
          'serviceIntro',
          'consentMessage',
          'expiration',
          'handledBy',
        ])
      : null;
  }, [request]);

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
    updateSelectedLanguage(newLocale);
  };

  const account: { name: string; type: 'person' | 'company' } = {
    name: memoizedRequest?.fromParty.name ?? '',
    type: memoizedRequest?.fromParty.type === 'Person' ? 'person' : 'company',
  };

  return (
    <RootProvider>
      <Layout
        color='neutral'
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
        <div className={classes.centerBlock}>
          {isLoadingRequest && (
            <DsSpinner
              aria-label={t('consent_request.loading_consent')}
              data-size='lg'
            />
          )}
          {loadRequestError && (
            <ConsentRequestError
              error={loadRequestError as { data: ProblemDetail }}
              defaultError='consent_request.load_consent_error'
            />
          )}
        </div>
        {memoizedRequest && (
          <ConsentRequestContent
            request={memoizedRequest}
            language={language}
          />
        )}
      </Layout>
    </RootProvider>
  );
};

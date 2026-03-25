import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import {
  DsAlert,
  DsSpinner,
  formatDisplayName,
  Layout,
  RootProvider,
} from '@altinn/altinn-components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { getAltinnStartPageUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
import { useUpdateSelectedLanguageMutation } from '@/rtk/features/settingsApi';
import classes from './DraftRequestPage.module.css';
import { useGetEnrichedDraftRequestQuery } from '@/rtk/features/requestApi';
import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PartyRepresentationProvider } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetUserProfileQuery } from '@/rtk/features/userInfoApi';
import { DraftRequestPageContent } from './DraftRequestPageContent';

export const DraftRequestPage = () => {
  const { t, i18n } = useTranslation();
  const [updateSelectedLanguage] = useUpdateSelectedLanguageMutation();

  useDocumentTitle(t('draft_request_page.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId') ?? '';
  const partyUuid = getCookie('AltinnPartyUuid') || '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetEnrichedDraftRequestQuery(
    { id: requestId },
    {
      skip: !requestId,
    },
  );

  const { data: userData } = useGetUserProfileQuery();

  useEffect(() => {
    // If the request is for a different user than the one currently logged in, redirect to the correct reportee
    if (request?.from.id && request.from.id !== partyUuid) {
      redirectToChangeReporteeAndRedirect(request?.from.id, window.location.href);
    }
  }, [request, partyUuid]);

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
    updateSelectedLanguage(newLocale);
  };

  const account: { name: string; type: 'person' | 'company' } = {
    name: request?.from.name ?? '',
    type: request?.from.type === 'Person' ? 'person' : 'company',
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
        {!requestId && (
          <div className={classes.centerBlock}>
            <DsAlert data-color='warning'>{t('draft_request_page.missing_request_id')}</DsAlert>
          </div>
        )}
        {isLoadingRequest && <LoadingState />}
        {loadRequestError && (
          <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>
        )}
        {request && (
          <PartyRepresentationProvider
            fromPartyUuid={partyUuid}
            actingPartyUuid={partyUuid}
            toPartyUuid={''}
            loadingComponent={<LoadingState />}
          >
            <DraftRequestPageContent request={request} />
          </PartyRepresentationProvider>
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

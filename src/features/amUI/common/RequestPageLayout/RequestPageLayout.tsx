import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import cn from 'classnames';
import { DsButton, DsSpinner, Layout, RootProvider } from '@altinn/altinn-components';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import { getButtonIconSize } from '@/resources/utils/iconUtils';
import { useRedirectToRequestParty } from '@/resources/hooks/useRedirectToRequestParty';
import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

import { useHeader } from '../PageLayoutWrapper/useHeader';
import { NavigationFocus } from '../PageLayoutWrapper/NavigationFocus';

import classes from './RequestPageLayout.module.css';

interface RequestPageLayoutProps {
  account: { name: string; type: 'person' | 'company' };
  isLoading: boolean;
  /**
   * The party the request belongs to. When it differs from the active reportee,
   * the user is redirected to switch reportee before the page is shown.
   */
  requestPartyUuid?: string;
  error?: React.ReactNode;
  heading?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
}

export const RequestPageLayout = ({
  account,
  isLoading,
  requestPartyUuid,
  error,
  heading,
  body,
  footer,
}: RequestPageLayoutProps) => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const backToPage = searchParams.get('backtopage');

  const languageCode = useLanguageCode();

  const partyUuid = useRedirectToRequestParty(requestPartyUuid);
  // While a reportee switch is pending, keep showing the loading state so the
  // page content isn't shown for the wrong party before the redirect happens.
  const isChangingParty = !!requestPartyUuid && requestPartyUuid !== partyUuid;
  const showLoading = isLoading || isChangingParty;

  const { header } = useHeader({
    openAccountMenu: false,
    hideSidebarItems: true,
  });

  return (
    <RootProvider languageCode={languageCode}>
      <NavigationFocus />
      <Layout
        color={account.type}
        theme='subtle'
        header={{
          ...header,
          disableAccountSelection: true,
          desktopMenu: {
            ...header.desktopMenu,
            items: [{ groupId: 'current-user', hidden: true }],
          },
          mobileMenu: {
            ...header.mobileMenu,
            items: [{ groupId: 'current-user', hidden: true }],
          },
          globalMenu: {
            ...header.globalMenu,
            logoutButton: undefined,
          },
        }}
        skipLink={{
          href: '#main-content',
          color: 'inherit',
          size: 'xs',
          children: t('common.skiplink'),
        }}
        content={{ color: account.type }}
      >
        {showLoading && <LoadingState />}
        {!showLoading && error && <div className={classes.centerBlock}>{error}</div>}
        {!showLoading && heading && body && (
          <div className={classes.centerBlock}>
            {backToPage && (
              <DsButton
                variant='tertiary'
                data-color='neutral'
                data-size='sm'
                className={classes.backButton}
                asChild
              >
                <Link to={backToPage}>
                  <ArrowLeftIcon
                    fontSize={getButtonIconSize(true)}
                    aria-hidden='true'
                  />
                  {t('common.back')}
                </Link>
              </DsButton>
            )}
            <div className={cn(classes.requestBlock, classes.headerBlock)}>{heading}</div>
            <div className={classes.requestBlock}>{body}</div>
            {footer}
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

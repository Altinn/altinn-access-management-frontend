import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PageLayoutWrapper } from '../common/PageLayoutWrapper';
import { AlertIfNotAvailableForUserType } from '../common/alertIfNotAvailableForUserType/AlertIfNotAvailableForUserType';

import { UsersList } from './UsersList';
import classes from './UsersList.module.css';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { rerouteIfNotConfetti } from '@/resources/utils/featureFlagUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';

export const UsersPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('users_page.page_title'));
  const { data: reportee } = useGetReporteeQuery();

  rerouteIfNotConfetti();

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PartyRepresentationProvider
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          actingPartyUuid={getCookie('AltinnPartyUuid')}
        >
          <AlertIfNotAvailableForUserType>
            <DsHeading
              level={1}
              data-size='md'
              className={classes.usersListHeading}
            >
              {t('users_page.main_page_heading', { name: reportee?.name || '' })}
            </DsHeading>
            <UsersList />
          </AlertIfNotAvailableForUserType>
        </PartyRepresentationProvider>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

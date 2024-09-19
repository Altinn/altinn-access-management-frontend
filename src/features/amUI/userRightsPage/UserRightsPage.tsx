import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from '@digdir/designsystemet-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { UserIcon } from '@/components/UserIcon/UserIcon';
import { PageWrapper } from '@/components';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookup/lookupApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { amUIPath } from '@/routes/paths';

import { PageContainer } from '../common/PageContainer/PageContainer';
import { FakePageWrapper } from '../common/FakePageWrapper';
import { SnackbarProvider } from '../common/Snackbar/SnackbarProvider';

import classes from './UserRightsPage.module.css';
import { SingleRightsSection } from './SingleRightsSection/SingleRightsSection';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const navigate = useNavigate();

  const { data: reportee } = useGetReporteeQuery();
  const { data: party } = useGetPartyByUUIDQuery(id ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const avatar = id ? <span>{party?.name?.charAt(0)}</span> : '';

  return (
    <PageWrapper>
      <SnackbarProvider>
        <FakePageWrapper reporteeName={reportee?.name || ''}>
          <PageContainer onNavigateBack={() => navigate(`/${amUIPath.Users}`)}>
            <div className={classes.headingRow}>
              <UserIcon
                icon={avatar}
                size={'lg'}
              />
              <Heading
                level={1}
                size='sm'
                className={classes.heading}
              >
                {party?.name}
              </Heading>
            </div>
            <SingleRightsSection />
          </PageContainer>
        </FakePageWrapper>
      </SnackbarProvider>
    </PageWrapper>
  );
};

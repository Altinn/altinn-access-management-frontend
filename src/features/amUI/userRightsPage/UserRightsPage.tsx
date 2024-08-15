import * as React from 'react';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';

import { Heading } from '@digdir/designsystemet-react';

import { FakePageWrapper } from '../common/FakePageWrapper';
import { useNavigate, useParams } from 'react-router-dom';
import { UserIcon } from '@/components/UserIcon/UserIcon';
import classes from './UserRightsPage.module.css';
import { PageContainer } from '../common/PageContainer/PageContainer';
import { PageWrapper } from '@/components';
import { useGetUserByUUIDQuery } from '@/rtk/features/lookup/lookupApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfo/userInfoApi';
import { amUIPath } from '@/routes/paths';

export const UserRightsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const navigate = useNavigate();

  const { data: reportee } = useGetReporteeQuery();
  const { data: user } = useGetUserByUUIDQuery(id ?? '');

  useDocumentTitle(t('user_rights_page.page_title'));
  const avatar = id ? <span>{user?.party.name?.charAt(0)}</span> : '';

  return (
    <PageWrapper>
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
              {user?.party.name}
            </Heading>
          </div>
        </PageContainer>
      </FakePageWrapper>
    </PageWrapper>
  );
};

import React from 'react';
import { Alert, Spinner, Paragraph } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useGetSystemUserQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';
import { PageWrapper } from '@/components';
import { SystemUserPath } from '@/routes/paths';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { RightsList } from '../components/RightsList/RightsList';
import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import { EditSystemUserModal } from '../components/EditSystemUserModal/EditSystemUserModal';

import classes from './SystemUserDetailsPage.module.css';

export const SystemUserDetailsPage = (): React.ReactNode => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));
  const partyId = getCookie('AltinnPartyId');

  const { data: reporteeData } = useGetReporteeQuery();

  const {
    data: systemUser,
    isError: isLoadSystemUserError,
    isLoading: isLoadingSystemUser,
    refetch: refetchSystemUser,
  } = useGetSystemUserQuery({ partyId, systemUserId: id || '' });

  const handleNavigateBack = (): void => {
    navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
  };

  const onSystemUserUpdated = (): void => {
    refetchSystemUser();
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PageContainer
          onNavigateBack={handleNavigateBack}
          pageActions={
            systemUser && (
              <EditSystemUserModal
                systemUser={systemUser}
                onSystemUserUpdated={onSystemUserUpdated}
              />
            )
          }
        >
          {isLoadingSystemUser && (
            <Spinner aria-label={t('systemuser_detailpage.loading_systemuser')} />
          )}
          {isLoadSystemUserError && (
            <Alert data-color='danger'>{t('systemuser_detailpage.load_systemuser_error')}</Alert>
          )}
          {systemUser && (
            <div className={classes.systemUserDetails}>
              <SystemUserHeader
                title={systemUser.integrationTitle}
                subTitle={reporteeData?.name}
              />
              <RightsList
                resources={systemUser.resources}
                accessPackages={systemUser.accessPackages}
              />
              <Paragraph
                data-size='xs'
                className={classes.createdBy}
              >
                {t('systemuser_detailpage.created_by', {
                  created: new Date(systemUser.created).toLocaleDateString('no-NB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }),
                })}
              </Paragraph>
            </div>
          )}
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

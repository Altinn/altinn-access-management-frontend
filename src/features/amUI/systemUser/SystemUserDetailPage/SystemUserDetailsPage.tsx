import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { DsSpinner, DsAlert, DsParagraph } from '@altinn/altinn-components';

import { RightsList } from '../components/RightsList/RightsList';
import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import { DeleteSystemUserPopover } from '../components/DeleteSystemUserPopover/DeleteSystemUserPopover';

import classes from './SystemUserDetailsPage.module.css';

import { useDeleteSystemuserMutation, useGetSystemUserQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';
import { PageWrapper } from '@/components';
import { SystemUserPath } from '@/routes/paths';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

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
  } = useGetSystemUserQuery({ partyId, systemUserId: id || '' });

  const [deleteSystemUser, { isError: isDeleteError, isLoading: isDeletingSystemUser }] =
    useDeleteSystemuserMutation();

  const handleDeleteSystemUser = (): void => {
    deleteSystemUser({ partyId, systemUserId: id || '' })
      .unwrap()
      .then(() => {
        handleNavigateBack();
      });
  };

  const handleNavigateBack = (): void => {
    navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PageContainer
          onNavigateBack={handleNavigateBack}
          pageActions={
            systemUser && (
              <DeleteSystemUserPopover
                integrationTitle={systemUser?.integrationTitle ?? ''}
                isDeleteError={isDeleteError}
                isDeletingSystemUser={isDeletingSystemUser}
                handleDeleteSystemUser={handleDeleteSystemUser}
              />
            )
          }
        >
          {isLoadingSystemUser && (
            <DsSpinner aria-label={t('systemuser_detailpage.loading_systemuser')} />
          )}
          {isLoadSystemUserError && (
            <DsAlert data-color='danger'>
              {t('systemuser_detailpage.load_systemuser_error')}
            </DsAlert>
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
              <DsParagraph
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
              </DsParagraph>
            </div>
          )}
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

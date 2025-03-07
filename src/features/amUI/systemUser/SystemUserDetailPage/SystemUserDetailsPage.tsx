import React, { useState } from 'react';
import { Button, Alert, Spinner, Paragraph, Popover } from '@digdir/designsystemet-react';
import { TrashIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { useDeleteSystemuserMutation, useGetSystemUserQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';
import { PageWrapper } from '@/components';
import { SystemUserPath } from '@/routes/paths';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';

import { ButtonRow } from '../components/ButtonRow/ButtonRow';
import { RightsList } from '../components/RightsList/RightsList';
import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';

import classes from './SystemUserDetailsPage.module.css';

export const SystemUserDetailsPage = (): React.ReactNode => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));
  const partyId = getCookie('AltinnPartyId');

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

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
        setIsPopoverOpen(false);
        handleNavigateBack();
      });
  };

  const handleNavigateBack = (): void => {
    navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
  };

  const numberOfRights =
    (systemUser?.resources?.length || 0) + (systemUser?.accessPackages?.length || 0);

  const deletePopover = (
    <div className={classes.systemUserDeleteButtonContainer}>
      <Popover.TriggerContext>
        <Popover.Trigger
          variant='tertiary'
          data-color='danger'
          onClick={() => setIsPopoverOpen(true)}
        >
          <TrashIcon aria-hidden />
          {t('systemuser_detailpage.delete_systemuser')}
        </Popover.Trigger>
        <Popover
          open={isPopoverOpen}
          data-color='danger'
          className={classes.deletePopover}
          onClose={() => setIsPopoverOpen(false)}
        >
          {t('systemuser_detailpage.delete_systemuser_body', {
            title: systemUser?.integrationTitle,
          })}
          {isDeleteError && (
            <Alert
              data-color='danger'
              role='alert'
            >
              {t('systemuser_detailpage.delete_systemuser_error')}
            </Alert>
          )}
          <ButtonRow>
            <Button
              data-color='danger'
              disabled={isDeletingSystemUser}
              onClick={handleDeleteSystemUser}
            >
              {t('systemuser_detailpage.delete_systemuser')}
            </Button>
            <Button
              variant='tertiary'
              onClick={() => setIsPopoverOpen(false)}
            >
              {t('common.cancel')}
            </Button>
          </ButtonRow>
        </Popover>
      </Popover.TriggerContext>
    </div>
  );

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <PageContainer
          onNavigateBack={handleNavigateBack}
          pageActions={deletePopover}
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
                title={
                  numberOfRights === 1
                    ? 'systemuser_detailpage.header_single'
                    : 'systemuser_detailpage.header'
                }
                integrationTitle={systemUser.integrationTitle}
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

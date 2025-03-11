import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { PlusIcon, TenancyIcon } from '@navikt/aksel-icons';
import { List } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetSystemUsersQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import { CreateSystemUserCheck } from '../components/CanCreateSystemUser/CanCreateSystemUser';

import classes from './SystemUserOverviewPage.module.css';

export const SystemUserOverviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));
  const routerLocation = useLocation();

  const partyId = getCookie('AltinnPartyId');
  const newlyCreatedId = routerLocation?.state?.createdId;

  const {
    data: systemUsers,
    isLoading: isLoadingSystemUsers,
    isError: isLoadSystemUsersError,
  } = useGetSystemUsersQuery(partyId);

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.flexContainer}>
          <Heading
            level={1}
            data-size='md'
          >
            {t('systemuser_overviewpage.banner_title')}
          </Heading>
          <Paragraph
            data-size='sm'
            className={classes.systemUserIngress}
          >
            {t('systemuser_overviewpage.sub_title_text')}
          </Paragraph>
          <CreateSystemUserCheck>
            <Button
              variant='secondary'
              className={classes.createSystemUserButton}
              asChild
            >
              <Link to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Create}`}>
                <PlusIcon
                  fontSize={28}
                  aria-hidden
                />
                {t('systemuser_overviewpage.new_system_user_button')}
              </Link>
            </Button>
            {isLoadingSystemUsers && (
              <Spinner aria-label={t('systemuser_overviewpage.loading_systemusers')} />
            )}
            {isLoadSystemUsersError && (
              <Alert data-color='danger'>
                {t('systemuser_overviewpage.systemusers_load_error')}
              </Alert>
            )}
            {systemUsers && systemUsers.length > 0 && (
              <>
                <Heading
                  level={2}
                  data-size='xs'
                  className={classes.systemUserHeader}
                >
                  {t('systemuser_overviewpage.existing_system_users_title')}
                </Heading>
                <List
                  defaultItemSize='lg'
                  items={systemUsers?.map((systemUser) => {
                    const isNew = newlyCreatedId === systemUser.id;
                    return {
                      title: systemUser.integrationTitle,
                      description: systemUser.system.systemVendorOrgName,
                      icon: TenancyIcon,
                      linkIcon: true,
                      badge: isNew
                        ? { label: t('systemuser_overviewpage.new_system_user'), color: 'info' }
                        : undefined,
                      onClick: () => navigate(`/systemuser/${systemUser.id}`),
                    };
                  })}
                />
              </>
            )}
          </CreateSystemUserCheck>
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

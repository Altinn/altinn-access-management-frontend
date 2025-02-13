import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Heading, Paragraph, Spinner, Tabs } from '@digdir/designsystemet-react';
import { PlusIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetSystemUsersQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { CreateSystemUserCheck } from '../components/CanCreateSystemUser/CanCreateSystemUser';
import { SystemUserActionBar } from '../components/SystemUserActionBar/SystemUserActionBar';

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
        <Tabs
          defaultValue='systemtilganger'
          className={classes.flexContainer}
        >
          <Tabs.List className={classes.systemUserTabs}>
            <Tabs.Tab value='systemtilganger'>
              {t('systemuser_overviewpage.systemuser_tab')}
            </Tabs.Tab>
            <Tabs.Tab value='apitilganger'>{t('systemuser_overviewpage.api_tab')}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='systemtilganger'>
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
                <Heading
                  level={2}
                  data-size='xs'
                  className={classes.systemUserHeader}
                >
                  {t('systemuser_overviewpage.existing_system_users_title')}
                </Heading>
                {isLoadingSystemUsers && (
                  <Spinner
                    aria-label={t('systemuser_overviewpage.loading_systemusers')}
                    title={''}
                  />
                )}
                {isLoadSystemUsersError && (
                  <Alert data-color='danger'>
                    {t('systemuser_overviewpage.systemusers_load_error')}
                  </Alert>
                )}
                <ul className={classes.unstyledList}>
                  {systemUsers?.map((systemUser) => (
                    <SystemUserActionBar
                      key={systemUser.id}
                      systemUser={systemUser}
                      isNew={newlyCreatedId === systemUser.id}
                      onClick={(systemUserId) => navigate(`/systemuser/${systemUserId}`)}
                    />
                  ))}
                </ul>
              </CreateSystemUserCheck>
            </div>
          </Tabs.Panel>
        </Tabs>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

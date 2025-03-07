import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Heading, Paragraph, Spinner, Tabs } from '@digdir/designsystemet-react';
import { PlusIcon, TenancyIcon } from '@navikt/aksel-icons';
import { List } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetClientSystemUsersQuery, useGetSystemUsersQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { CreateSystemUserCheck } from '../components/CanCreateSystemUser/CanCreateSystemUser';
import type { SystemUser } from '../types';

import classes from './SystemUserOverviewPage.module.css';

export const SystemUserOverviewPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));

  const partyId = getCookie('AltinnPartyId');

  const {
    data: systemUsers,
    isLoading: isLoadingSystemUsers,
    isError: isLoadSystemUsersError,
  } = useGetSystemUsersQuery(partyId);

  const {
    data: clientSystemUsers,
    isLoading: isLoadingClientSystemUsers,
    isError: isLoadClientSystemUsersError,
  } = useGetClientSystemUsersQuery(partyId);

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
                {isLoadingSystemUsers && isLoadingClientSystemUsers && (
                  <Spinner aria-label={t('systemuser_overviewpage.loading_systemusers')} />
                )}
                <SystemUserList systemUsers={systemUsers} />
                {isLoadSystemUsersError && (
                  <Alert data-color='danger'>
                    {t('systemuser_overviewpage.systemusers_load_error')}
                  </Alert>
                )}
                <SystemUserList
                  systemUsers={clientSystemUsers}
                  isClientList
                />
                {isLoadClientSystemUsersError && (
                  <Alert data-color='danger'>
                    {t('systemuser_overviewpage.client_delegation_systemusers_load_error')}
                  </Alert>
                )}
              </CreateSystemUserCheck>
            </div>
          </Tabs.Panel>
        </Tabs>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
interface SystemUserListProps {
  systemUsers: SystemUser[] | undefined;
  isClientList?: boolean;
}

const SystemUserList = ({ systemUsers, isClientList }: SystemUserListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const newlyCreatedId = routerLocation?.state?.createdId;

  return systemUsers && systemUsers.length > 0 ? (
    <>
      <Heading
        level={2}
        data-size='xs'
        className={classes.systemUserHeader}
      >
        {isClientList
          ? t('systemuser_overviewpage.client_delegation_systemusers_title')
          : t('systemuser_overviewpage.existing_system_users_title')}
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
            onClick: () => {
              const url = isClientList
                ? `/systemuser/${systemUser.id}/clientdelegations`
                : `/systemuser/${systemUser.id}`;
              navigate(url);
            },
          };
        })}
      />
    </>
  ) : (
    <></>
  );
};

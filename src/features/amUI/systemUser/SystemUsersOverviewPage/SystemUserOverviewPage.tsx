import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Heading, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { PlusIcon } from '@navikt/aksel-icons';
import { ListItem } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetSystemUsersQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';

import { PageLayoutWrapper } from '../../common/PageLayoutWrapper';
import { CreateSystemUserCheck } from '../components/CanCreateSystemUser/CanCreateSystemUser';

import classes from './SystemUserOverviewPage.module.css';

export const SystemUserOverviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const partyId = getCookie('AltinnPartyId');
  useDocumentTitle(t('systemuser_overviewpage.page_title'));

  const {
    data: systemUsers,
    isLoading: isLoadingSystemUsers,
    isError: isLoadSystemUsersError,
  } = useGetSystemUsersQuery(partyId);

  if (isLoadingSystemUsers) {
    return (
      <Spinner
        aria-label={t('systemuser_overviewpage.loading_systemusers')}
        title={''}
      />
    );
  }

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Heading
          level={1}
          size='md'
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
            <Link to={'/' + SystemUserPath.Create}>
              <PlusIcon fontSize={28} />
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
          {isLoadSystemUsersError && (
            <Alert data-color='danger'>{t('systemuser_overviewpage.systemusers_load_error')}</Alert>
          )}
          <ul className={classes.unstyledList}>
            {systemUsers?.map((systemUser) => (
              <li key={systemUser.id}>
                <ListItem
                  size='lg'
                  title={systemUser.integrationTitle}
                  description={systemUser.system.systemVendorOrgName}
                  icon={{ name: 'tenancy', theme: 'surface' }}
                  linkIcon='chevron-right'
                  onClick={() => navigate(`/systemuser/${systemUser.id}`)}
                />
              </li>
            ))}
          </ul>
        </CreateSystemUserCheck>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

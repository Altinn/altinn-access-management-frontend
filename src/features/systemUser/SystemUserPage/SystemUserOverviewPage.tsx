import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Heading, Modal, Paragraph, Spinner } from '@digdir/designsystemet-react';
import { PlusIcon } from '@navikt/aksel-icons';
import { ListItem } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import { useGetSystemUsersQuery } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { PageLayoutWrapper } from '../../amUI/common/PageLayoutWrapper';
import type { SystemUser } from '../types';

import classes from './SystemUserOverviewPage.module.css';
import { CreateSystemUser } from './CreateSystemUser/CreateSystemUser';

export const SystemUserOverviewPage = () => {
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const modalRef = useRef<HTMLDialogElement>(null);
  useDocumentTitle(t('users_page.page_title'));

  const {
    data: systemUsers,
    isLoading: isLoadingSystemUsers,
    isError: isLoadSystemUsersError,
  } = useGetSystemUsersQuery(partyId);

  const newlyCreatedId = '';
  const newlyCreatedItem = systemUsers?.find((systemUser) => systemUser.id === newlyCreatedId);

  const systemUsersWithoutCreatedItem =
    systemUsers &&
    [...systemUsers].reverse().filter((systemUser) => systemUser.id !== newlyCreatedId);

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
          Systemtilgang
        </Heading>
        <div>
          <div className={classes.pageDescription}>
            <Heading
              level={2}
              data-size='sm'
            >
              {t('systemuser_overviewpage.sub_title')}
            </Heading>
            <Paragraph data-size='sm'>{t('systemuser_overviewpage.sub_title_text')}</Paragraph>
          </div>
          <Button
            variant='secondary'
            className={classes.triggerButton}
            onClick={() => modalRef.current?.showModal()}
          >
            <PlusIcon fontSize={28} />
            {t('systemuser_overviewpage.new_system_user_button')}
          </Button>
          <Modal
            ref={modalRef}
            closeButton={false}
            style={{
              overflow: 'visible',
              minWidth: '45rem',
            }}
          >
            <CreateSystemUser onClose={() => modalRef.current?.close()} />
          </Modal>
          {/*!userCanCreateSystemUser && <RightsError />*/}
          {isLoadSystemUsersError && (
            <Alert data-color='danger'>{t('systemuser_overviewpage.systemusers_load_error')}</Alert>
          )}
          {newlyCreatedItem && (
            <div>
              <Heading
                level={2}
                data-size='xs'
                className={classes.systemUserHeader}
              >
                {t('systemuser_overviewpage.created_system_user_title')}
              </Heading>
              <SystemUserActionBar2
                systemUser={newlyCreatedItem}
                defaultOpen
              />
            </div>
          )}
          {systemUsersWithoutCreatedItem && systemUsersWithoutCreatedItem.length > 0 && (
            <>
              <Heading
                level={2}
                data-size='xs'
                className={classes.systemUserHeader}
              >
                {newlyCreatedItem
                  ? t('systemuser_overviewpage.existing_earlier_system_users_title')
                  : t('systemuser_overviewpage.existing_system_users_title')}
              </Heading>
              <ul className={classes.unstyledList}>
                {systemUsersWithoutCreatedItem.map((systemUser) => (
                  <li key={systemUser.id}>
                    <SystemUserActionBar2 systemUser={systemUser} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

interface SystemUserActionBarProps {
  systemUser: SystemUser;
  defaultOpen?: boolean;
}

const SystemUserActionBar2 = ({ systemUser }: SystemUserActionBarProps) => {
  return (
    <ListItem
      size='lg'
      title={systemUser.integrationTitle}
      description={systemUser.system.systemVendorOrgName}
      icon={{ name: 'tenancy', theme: 'surface' }}
      linkIcon='chevron-right'
    />
  );
};

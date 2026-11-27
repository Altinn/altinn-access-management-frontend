import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DsHeading, DsParagraph, DsAlert, DsButton, DsSpinner } from '@altinn/altinn-components';

import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { SystemUserPath } from '@/routes/paths';
import { useGetRegisteredSystemsQuery } from '@/rtk/features/systemUserApi';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { ButtonRow } from '../components/ButtonRow/ButtonRow';
import type { RegisteredSystem } from '../types';
import { CreateSystemUserCheck } from '../components/CreateSystemUserCheck/CreateSystemUserCheck';

import classes from './CreateSystemUser.module.css';
import { RegisteredSystemSearch } from './RegisteredSystemSearch';

interface SelectRegisteredSystemProps {
  selectedSystem: RegisteredSystem | undefined;
  setSelectedSystem: (selectedSystem: RegisteredSystem | undefined) => void;
  handleConfirm: () => void;
}

export const SelectRegisteredSystem = ({
  selectedSystem,
  setSelectedSystem,
  handleConfirm,
}: SelectRegisteredSystemProps) => {
  const { t } = useTranslation();
  const { data: reporteeData, isLoading: isLoadingReportee } = useGetReporteeQuery();

  const {
    data: registeredSystems,
    isLoading: isLoadingRegisteredSystems,
    isError: isLoadRegisteredSystemsError,
  } = useGetRegisteredSystemsQuery();
  const { data: isAdmin } = useGetIsAdminQuery();

  return (
    <PageContainer backUrl={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}>
      <div className={classes.creationPageContainer}>
        <DsHeading
          level={1}
          data-size='sm'
        >
          {t('systemuser_creationpage.sub_title')}
        </DsHeading>
        {isLoadingReportee && (
          <DsSpinner aria-label={t('systemuser_creationpage.loading_systems')} />
        )}
        <CreateSystemUserCheck
          reporteeData={reporteeData}
          isAdmin={isAdmin}
        >
          <DsParagraph
            data-size='sm'
            className={classes.systemDescription}
          >
            {t('systemuser_creationpage.content_text1')}
          </DsParagraph>
          <div className={classes.inputContainer}>
            <RegisteredSystemSearch
              label={t('systemuser_creationpage.pull_down_menu_label')}
              placeholder={t('systemuser_creationpage.system_search_placeholder')}
              systems={registeredSystems ?? []}
              selectedSystem={selectedSystem}
              onSelectSystem={setSelectedSystem}
              isLoading={isLoadingRegisteredSystems}
            />
            {isLoadRegisteredSystemsError && (
              <DsAlert data-color='danger'>
                {t('systemuser_creationpage.load_vendors_error')}
              </DsAlert>
            )}
          </div>
          <ButtonRow>
            <DsButton
              variant='primary'
              onClick={handleConfirm}
              disabled={!selectedSystem}
            >
              {t('systemuser_creationpage.confirm_button')}
            </DsButton>
            <DsButton
              variant='tertiary'
              asChild
            >
              <Link to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`}>
                {t('common.cancel')}
              </Link>
            </DsButton>
          </ButtonRow>
        </CreateSystemUserCheck>
      </div>
    </PageContainer>
  );
};

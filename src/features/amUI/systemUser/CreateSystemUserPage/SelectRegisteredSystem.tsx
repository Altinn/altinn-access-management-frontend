import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { DsHeading, DsParagraph, DsAlert, DsButton, DsCombobox } from '@altinn/altinn-components';

import { useGetRegisteredSystemsQuery } from '@/rtk/features/systemUserApi';
import { SystemUserPath } from '@/routes/paths';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { ButtonRow } from '../components/ButtonRow/ButtonRow';
import type { RegisteredSystem } from '../types';
import { CreateSystemUserCheck } from '../components/CanCreateSystemUser/CanCreateSystemUser';

import classes from './CreateSystemUser.module.css';

const isStringMatch = (inputString: string, matchString = ''): boolean => {
  return matchString.toLowerCase().indexOf(inputString.toLowerCase()) >= 0;
};

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
  const navigate = useNavigate();
  const { data: reporteeData } = useGetReporteeQuery();

  const {
    data: registeredSystems,
    isLoading: isLoadingRegisteredSystems,
    isError: isLoadRegisteredSystemsError,
  } = useGetRegisteredSystemsQuery();

  const onSelectSystem = (newValue: string[]) => {
    setSelectedSystem(registeredSystems?.find((system) => system.systemId === newValue[0]));
  };

  return (
    <PageContainer
      onNavigateBack={() => navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`)}
    >
      <div className={classes.creationPageContainer}>
        <DsHeading
          level={1}
          data-size='sm'
        >
          {t('systemuser_creationpage.sub_title')}
        </DsHeading>
        <CreateSystemUserCheck reporteeData={reporteeData}>
          <DsParagraph
            data-size='sm'
            className={classes.systemDescription}
          >
            {t('systemuser_creationpage.content_text1')}
          </DsParagraph>
          <div className={classes.inputContainer}>
            <DsCombobox
              label={t('systemuser_creationpage.pull_down_menu_label')}
              loading={isLoadingRegisteredSystems}
              loadingLabel={t('systemuser_creationpage.loading_systems')}
              placeholder={t('systemuser_creationpage.choose')}
              value={selectedSystem ? [selectedSystem.systemId] : undefined}
              onValueChange={onSelectSystem}
              filter={(inputValue: string, { label, description }) => {
                const isLabelMatch = isStringMatch(inputValue, label);
                const isDescriptionMatch = isStringMatch(inputValue, description);
                return isLabelMatch || isDescriptionMatch;
              }}
            >
              {registeredSystems?.map((system) => {
                return (
                  <DsCombobox.Option
                    key={system.systemId}
                    value={system.systemId}
                    description={`${system.systemVendorOrgName} (${system.systemVendorOrgNumber})`}
                  >
                    {system.name}
                  </DsCombobox.Option>
                );
              })}
            </DsCombobox>
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

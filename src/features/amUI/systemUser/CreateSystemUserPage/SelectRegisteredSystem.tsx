import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import {
  DsHeading,
  DsParagraph,
  DsAlert,
  DsButton,
  Field,
  Label,
  DsSpinner,
} from '@altinn/altinn-components';

import { useGetRegisteredSystemsQuery } from '@/rtk/features/systemUserApi';
import { SystemUserPath } from '@/routes/paths';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { ButtonRow } from '../components/ButtonRow/ButtonRow';
import { CreateSystemUserCheck } from '../components/CanCreateSystemUser/CanCreateSystemUser';
import {
  EXPERIMENTAL_Suggestion as Suggestion,
  SuggestionItem,
} from '@digdir/designsystemet-react';

import classes from './CreateSystemUser.module.css';

const EMPTY_SUGGESTION_ITEM: SuggestionItem = { value: '', label: '' };

interface SelectRegisteredSystemProps {
  selectedSystem: SuggestionItem | undefined;
  setSelectedSystem: (selectedSystem: SuggestionItem | undefined) => void;
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

  const onSelectSystem = (newValue: SuggestionItem | undefined) => {
    setSelectedSystem(newValue);
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
            {isLoadingRegisteredSystems ? (
              <DsSpinner aria-label={t('systemuser_creationpage.loading_systems')} />
            ) : (
              <Field>
                <Label>{t('systemuser_creationpage.pull_down_menu_label')}</Label>
                <Suggestion
                  multiple={false}
                  selected={selectedSystem ?? EMPTY_SUGGESTION_ITEM}
                  onSelectedChange={onSelectSystem}
                  filter={({ text, input }) => {
                    return text.toLowerCase().includes(input.value.toLowerCase());
                  }}
                >
                  <Suggestion.Input placeholder={t('systemuser_creationpage.choose')} />
                  <Suggestion.Clear />
                  <Suggestion.List>
                    <Suggestion.Empty>{t('systemuser_creationpage.empty_option')}</Suggestion.Empty>
                    {registeredSystems?.map((system) => {
                      return (
                        <Suggestion.Option
                          key={system.systemId}
                          value={system.systemId}
                          label={system.name}
                        >
                          {system.name}
                          <div className={classes.descriptionText}>
                            {`${system.systemVendorOrgName} (${system.systemVendorOrgNumber})`}
                          </div>
                        </Suggestion.Option>
                      );
                    })}
                  </Suggestion.List>
                </Suggestion>
              </Field>
            )}
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

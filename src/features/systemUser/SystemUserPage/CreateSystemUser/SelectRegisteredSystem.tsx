import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Combobox, Heading, Paragraph } from '@digdir/designsystemet-react';

import { useGetRegisteredSystemsQuery } from '@/rtk/features/systemUserApi';

import { ButtonRow } from '../../components/ButtonRow/ButtonRow';
import type { RegisteredSystem } from '../../types';

import classes from './CreateSystemUser.module.css';

const isStringMatch = (inputString: string, matchString = ''): boolean => {
  return matchString.toLowerCase().indexOf(inputString.toLowerCase()) >= 0;
};

interface SelectRegisteredSystemProps {
  selectedSystem: RegisteredSystem | undefined;
  setSelectedSystem: (selectedSystem: RegisteredSystem | undefined) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const SelectRegisteredSystem = ({
  selectedSystem,
  setSelectedSystem,
  handleConfirm,
  handleCancel,
}: SelectRegisteredSystemProps) => {
  const { t } = useTranslation();

  const {
    data: registeredSystems,
    isLoading: isLoadingRegisteredSystems,
    isError: isLoadRegisteredSystemsError,
  } = useGetRegisteredSystemsQuery();

  const onSelectSystem = (newValue: string[]) => {
    setSelectedSystem(registeredSystems?.find((system) => system.systemId === newValue[0]));
  };

  return (
    <>
      <Heading
        level={2}
        data-size='sm'
      >
        {t('systemuser_creationpage.sub_title')}
      </Heading>
      <Paragraph data-size='sm'>{t('systemuser_creationpage.content_text1')}</Paragraph>
      <div className={classes.inputContainer}>
        <Combobox
          label={t('systemuser_creationpage.pull_down_menu_label')}
          loading={isLoadingRegisteredSystems}
          loadingLabel={t('systemuser_creationpage.loading_systems')}
          placeholder={t('systemuser_creationpage.choose')}
          portal={false}
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
              <Combobox.Option
                key={system.systemId}
                value={system.systemId}
                description={`${system.systemVendorOrgName} (${system.systemVendorOrgNumber})`}
              >
                {system.name}
              </Combobox.Option>
            );
          })}
        </Combobox>
        {isLoadRegisteredSystemsError && (
          <Alert data-color='danger'>{t('systemuser_creationpage.load_vendors_error')}</Alert>
        )}
      </div>
      <ButtonRow>
        <Button
          variant='primary'
          data-size='sm'
          onClick={handleConfirm}
          disabled={!selectedSystem}
        >
          {t('systemuser_creationpage.confirm_button')}
        </Button>
        <Button
          variant='tertiary'
          data-size='sm'
          onClick={handleCancel}
        >
          {t('common.cancel')}
        </Button>
      </ButtonRow>
    </>
  );
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@digdir/designsystemet-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

import { getButtonIconSize } from '@/resources/utils';

import type { RegisteredSystem } from '../../types';

import classes from './CreateSystemUser.module.css';
import { SelectRegisteredSystem } from './SelectRegisteredSystem';
import { RightsIncluded } from './RightsIncluded';

interface CreateSystemUserProps {
  onClose: () => void;
}

export const CreateSystemUser = ({ onClose }: CreateSystemUserProps): React.ReactNode => {
  const { t } = useTranslation();

  const [selectedSystem, setSelectedSystem] = useState<RegisteredSystem | undefined>(undefined);
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);

  const handleConfirmSystem = () => {
    setIsConfirmStep(true);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleNavigateBack = () => {
    setIsConfirmStep(false);
  };

  return (
    <>
      {isConfirmStep && (
        <Button
          variant='tertiary'
          size='sm'
          icon
          onClick={handleNavigateBack}
        >
          <ArrowLeftIcon fontSize={getButtonIconSize(true)} />
          {t('common.back')}
        </Button>
      )}
      <div className={classes.creationPageContainer}>
        {isConfirmStep && selectedSystem ? (
          <RightsIncluded
            selectedSystem={selectedSystem}
            handleCancel={handleCancel}
          />
        ) : (
          <SelectRegisteredSystem
            selectedSystem={selectedSystem}
            setSelectedSystem={setSelectedSystem}
            handleConfirm={handleConfirmSystem}
            handleCancel={handleCancel}
          />
        )}
      </div>
    </>
  );
};

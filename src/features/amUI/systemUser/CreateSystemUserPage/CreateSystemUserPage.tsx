import React, { useState } from 'react';

import { PageWrapper } from '@/components';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import type { RegisteredSystem } from '../types';

import { SelectRegisteredSystem } from './SelectRegisteredSystem';
import { RightsIncluded } from './RightsIncluded';

export const CreateSystemUserPage = (): React.ReactNode => {
  const [selectedSystem, setSelectedSystem] = useState<RegisteredSystem | undefined>(undefined);
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);

  const handleConfirmSystem = () => {
    setIsConfirmStep(true);
  };

  const handleNavigateBack = () => {
    setIsConfirmStep(false);
  };

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {isConfirmStep && selectedSystem ? (
          <RightsIncluded
            selectedSystem={selectedSystem}
            onNavigateBack={handleNavigateBack}
          />
        ) : (
          <SelectRegisteredSystem
            selectedSystem={selectedSystem}
            setSelectedSystem={setSelectedSystem}
            handleConfirm={handleConfirmSystem}
          />
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

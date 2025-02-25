import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';

import type { RegisteredSystem } from '../types';
import { SystemUserPageLayoutWrapper } from '../SystemUserPageLayoutWrapper';

import { SelectRegisteredSystem } from './SelectRegisteredSystem';
import { RightsIncluded } from './RightsIncluded';

export const CreateSystemUserPage = (): React.ReactNode => {
  const { t } = useTranslation();
  useDocumentTitle(t('systemuser_creationpage.page_title'));
  const [selectedSystem, setSelectedSystem] = useState<RegisteredSystem | undefined>(undefined);
  const [isConfirmStep, setIsConfirmStep] = useState<boolean>(false);

  const handleConfirmSystem = () => {
    setIsConfirmStep(true);
  };

  const handleNavigateBack = () => {
    setIsConfirmStep(false);
  };

  return (
    <div className='systemuser_combobox_workaround'>
      <PageWrapper>
        <SystemUserPageLayoutWrapper>
          {!isConfirmStep && (
            <SelectRegisteredSystem
              selectedSystem={selectedSystem}
              setSelectedSystem={setSelectedSystem}
              handleConfirm={handleConfirmSystem}
            />
          )}
          {isConfirmStep && selectedSystem && (
            <RightsIncluded
              selectedSystem={selectedSystem}
              onNavigateBack={handleNavigateBack}
            />
          )}
        </SystemUserPageLayoutWrapper>
      </PageWrapper>
    </div>
  );
};

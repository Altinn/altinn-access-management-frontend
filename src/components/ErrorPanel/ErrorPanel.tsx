import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/rtk/app/hooks';

import classes from './ErrorPanel.module.css';

export interface ErrorPanelProps {
  message?: string;
  errorStatusCode?: string;
}

export const ErrorPanel = () => {
  const error = useAppSelector((state) => state.delegableApi.error);
  const { t } = useTranslation('common');

  return (
    <Panel
      title={t('api_delegation.data_retrieval_failed')}
      variant={PanelVariant.Error}
      forceMobileLayout
    >
      <div>
        {t('common.error_status_code')}: {error}
      </div>
    </Panel>
  );
};

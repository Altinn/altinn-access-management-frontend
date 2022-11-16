import { useState } from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Page,
  PageHeader,
  PageContent,
  Button,
  ButtonVariant,
} from '@altinn/altinn-design-system';
import { useTranslation } from 'react-i18next';

import { ApiDelegationOverviewPageContent } from './ApiDelegationOverviewPageContent';
import classes from './DelegationOverviewPage.module.css';
import { OrgDelegationOverviewPageContent } from './OrgDelegationOverviewPageContent';

interface ChangeProps {
  selectedValue: string;
}

export const DelegationOverviewPage = () => {
  const [selected, setSelected] = useState('organization');
  const { t } = useTranslation('common');

  const handleChange = ({ selectedValue }: ChangeProps) => {
    setSelected(selectedValue);
  };
  return (
    <div>
      <Page>
        <PageHeader>{t('api_delegation.api_delegations')}</PageHeader>
        <PageContent>
          <div className={classes.pageContent}>
            <ToggleButtonGroup
              onChange={handleChange}
              selectedValue={selected}
            >
              <ToggleButton value='organization'>{t('api_delegation.businesses')}</ToggleButton>
              <ToggleButton value='api'>{t('api_delegation.delegated_apis')}</ToggleButton>
            </ToggleButtonGroup>
            {selected === 'organization' && <OrgDelegationOverviewPageContent />}
            {selected === 'api' && <ApiDelegationOverviewPageContent />}
          </div>
        </PageContent>
      </Page>
    </div>
  );
};

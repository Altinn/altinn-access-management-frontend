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
        <PageHeader>Header her</PageHeader>
        <PageContent>
          <div className={classes.pageContent}>
            <ToggleButtonGroup
              onChange={handleChange}
              selectedValue={selected}
            >
              <ToggleButton value='organization'>Virksomheter</ToggleButton>
              <ToggleButton value='api'>Delegerte API</ToggleButton>
            </ToggleButtonGroup>
            <div>
              <Button variant={ButtonVariant.Outline}>t</Button>
            </div>
            {selected === 'organization' && <OrgDelegationOverviewPageContent />}
            {selected === 'api' && <ApiDelegationOverviewPageContent />}
          </div>
        </PageContent>
      </Page>
    </div>
  );
};

import { Button, ButtonColor, ButtonVariant, Panel } from '@altinn/altinn-design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { save } from '@/rtk/features/overviewOrg/overviewOrgSlice';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OrgDelegationOverviewPageContent.module.css';

export const OrgDelegationOverviewPageContent = () => {
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const softDeletedItems = useAppSelector((state) => state.overviewOrg.softDeletedItems);
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState(true);
  const { t } = useTranslation('common');

  useEffect(() => {
    if (softDeletedItems.length >= 1) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  });

  const accordions = overviewOrgs.map((org) => (
    <OrgDelegationAccordion
      key={org.id}
      name={org.name}
      organization={org}
    ></OrgDelegationAccordion>
  ));

  return (
    <div className={classes.overviewAccordionsContainer}>
      <div className={classes.delegateNewButton}>
        <Button variant={ButtonVariant.Outline}>{t('api_delegation.delegate_new_org')}</Button>
      </div>
      <Panel title={'Programmeringsgrensesnitt - API'}>
        {t('api_delegation.api_panel_content')}
      </Panel>
      <h2 className={classes.apiSubheading}>{t('api_delegation.you_have_delegated_accesses')}</h2>
      <div className={classes.accordion}>{accordions}</div>
      <div className={classes.saveSection}>
        <Button
          disabled={disabled}
          onClick={() => dispatch(save())}
          color={ButtonColor.Success}
        >
          {t('api_delegation.save')}
        </Button>
      </div>
    </div>
  );
};

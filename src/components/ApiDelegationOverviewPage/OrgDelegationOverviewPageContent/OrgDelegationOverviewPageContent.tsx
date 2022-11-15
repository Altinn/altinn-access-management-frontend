import { Button, ButtonColor } from '@altinn/altinn-design-system';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { save } from '@/rtk/features/overviewOrg/overviewOrgSlice';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OrgDelegationOverviewPageContent.module.css';

export const OrgDelegationOverviewPageContent = () => {
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const softDeletedItems = useAppSelector((state) => state.overviewOrg.softDeletedItems);
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState(true);

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
      {accordions}
      <div className={classes.saveSection}>
        <Button
          disabled={disabled}
          onClick={() => dispatch(save())}
          color={ButtonColor.Success}
        >
          Lagre
        </Button>
      </div>
    </div>
  );
};

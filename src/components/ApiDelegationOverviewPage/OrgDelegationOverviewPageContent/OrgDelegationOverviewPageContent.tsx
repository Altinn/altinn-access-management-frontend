import { Button, ButtonColor } from '@altinn/altinn-design-system';
import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { save } from '@/rtk/features/overviewOrg/overviewOrgSlice';

import { OrgDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OrgDelegationOverviewPageContent.module.css';

export const OrgDelegationOverviewPageContent = () => {
  const overviewOrgs = useAppSelector((state) => state.overviewOrg.overviewOrgs);
  const softDeletedItems = useAppSelector((state) => state.overviewOrg.softDeletedOrgsItems);
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState(true);
  const hasSoftDeletedItems = () => {
    if (softDeletedItems.length >= 1) {
      setDisabled(true);
    }
    setDisabled(false);
  };
  /* const saveChanges = () => {
    const newState = [];
    for (const api of delegations) {
      const updatedAPI = {
        id: api.id,
        apiName: api.apiName,
        organizations: api.organizations.filter((b) => !b.isSoftDelete),
      };
      if (updatedAPI.organizations.length > 0) {
        newState.push(updatedAPI);
      }
    }
    setDelegations(newState);
  }; */

  const accordions = overviewOrgs.map((org) => (
    <OrgDelegationAccordion
      key={org.id}
      name={org.name}
      organization={org}
    ></OrgDelegationAccordion>
  ));

  const handleSave = () => {
    dispatch(save(overviewOrgs));
  };

  return (
    <div className={classes.overviewAccordionsContainer}>
      {accordions}
      <div className={classes.saveSection}>
        <Button
          disabled={disabled}
          onClick={handleSave}
          color={ButtonColor.Success}
        >
          Lagre
        </Button>
      </div>
    </div>
  );
};

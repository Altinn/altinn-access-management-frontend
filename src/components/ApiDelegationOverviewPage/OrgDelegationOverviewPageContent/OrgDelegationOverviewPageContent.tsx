import { useState } from 'react';
import { Button } from '@altinn/altinn-design-system';

import { ApiDelegationAccordion } from './OrgDelegationAccordion';
import classes from './OrgDelegationOverviewPageContent.module.css';

export const OrgDelegationOverviewPageContent = () => {
  function unique() {
    return ++unique.i;
  }
  unique.i = 0;

  const [delegations, setDelegations] = useState([
    {
      id: unique(),
      apiName: 'Evry',
      organizations: [
        { id: unique(), name: 'Delegert API A', isSoftDelete: false },
        { id: unique(), name: 'Delegert API B', isSoftDelete: false },
        { id: unique(), name: 'Delegert API C', isSoftDelete: false },
      ],
    },
    {
      id: unique(),
      apiName: 'Skatteetaten',
      organizations: [
        { id: unique(), name: 'Delegert API A', isSoftDelete: false },
        { id: unique(), name: 'Delegert API B', isSoftDelete: false },
        { id: unique(), name: 'Delegert API C', isSoftDelete: false },
      ],
    },
    {
      id: unique(),
      apiName: 'Accenture',
      organizations: [
        { id: unique(), name: 'Delegert API A', isSoftDelete: false },
        { id: unique(), name: 'Delegert API B', isSoftDelete: false },
        { id: unique(), name: 'Delegert API C', isSoftDelete: false },
      ],
    },
  ]);

  const setOrganizationsArray = (
    apiID: number,
    newOrgArray: Array<{ id: number; name: string; isSoftDelete: boolean }>,
  ) => {
    const newDelegations = [...delegations];
    for (const api of newDelegations) {
      if (api.id === apiID) {
        api.organizations = newOrgArray;
      }
    }
    setDelegations(newDelegations);
  };

  const hasDeletableItems = () => {
    for (const api of delegations) {
      for (const item of api.organizations) {
        if (item.isSoftDelete) {
          return true;
        }
      }
    }
    return false;
  };

  const saveChanges = () => {
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
  };

  const accordions = delegations.map((i) => (
    <ApiDelegationAccordion
      key={i.id}
      name={i.apiName}
      organizations={i.organizations}
      setOrganizations={(newOrgArray: Array<{ id: number; name: string; isSoftDelete: boolean }>) =>
        setOrganizationsArray(i.id, newOrgArray)
      }
    ></ApiDelegationAccordion>
  ));

  return (
    <div className={classes.overviewAccordionsContainer}>
      {accordions}
      <div className={classes.saveSection}>
        <Button
          disabled={!hasDeletableItems()}
          onClick={saveChanges}
        >
          Lagre
        </Button>
      </div>
    </div>
  );
};

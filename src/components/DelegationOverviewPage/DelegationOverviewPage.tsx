import { useState } from 'react';
import { Button, Page, PageHeader, PageContent } from '@altinn/altinn-design-system';
import cn from 'classnames';

import { DelegationAccordion } from './DelegationAccordion';
import classes from './DelegationOverviewPage.module.css';

export const DelegationOverviewPage = () => {
  function unique() {
    return ++unique.i;
  }
  unique.i = 0;

  const [delegations, setDelegations] = useState([
    {
      id: unique(),
      apiName: 'Delegert API A',
      organizations: [
        { id: unique(), name: 'Virksomhet 1', isSoftDelete: false },
        { id: unique(), name: 'Virksomhet 2', isSoftDelete: false },
        { id: unique(), name: 'Virksomhet 3', isSoftDelete: false },
      ],
    },
    {
      id: unique(),
      apiName: 'Delegert API B',
      organizations: [
        { id: unique(), name: 'Virksomhet 1', isSoftDelete: false },
        { id: unique(), name: 'Virksomhet 4', isSoftDelete: false },
        { id: unique(), name: 'Virksomhet 6', isSoftDelete: false },
      ],
    },
    {
      id: unique(),
      apiName: 'Delegert API C',
      organizations: [
        { id: unique(), name: 'Virksomhet 1', isSoftDelete: false },
        { id: unique(), name: 'Virksomhet 4', isSoftDelete: false },
        { id: unique(), name: 'Virksomhet 5', isSoftDelete: false },
      ],
    },
  ]);

  const setOrganizationsArray = (
    apiID: number,
    newArray: Array<{ id: number; name: string; isSoftDelete: boolean }>,
  ) => {
    const newDelegations = [...delegations];
    for (const api of newDelegations) {
      if (api.id === apiID) {
        api.organizations = newArray;
      }
    }
    setDelegations(newDelegations);
  };

  const areDeletableItems = () => {
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
    <DelegationAccordion
      key={i.id}
      name={i.apiName}
      apiId={i.id}
      organizations={i.organizations}
      setOrganizations={setOrganizationsArray}
    ></DelegationAccordion>
  ));

  return (
    <div>
      <Page>
        <PageHeader>Header her</PageHeader>
        <PageContent>
          <div className={cn(classes['delegation-overview-page__page-content'])}>
            {accordions}
            <div className={cn(classes['delegation-overview-page__save-section'])}>
              <Button
                disabled={!areDeletableItems()}
                onClick={saveChanges}
              >
                Lagre
              </Button>
            </div>
          </div>
        </PageContent>
      </Page>
    </div>
  );
};

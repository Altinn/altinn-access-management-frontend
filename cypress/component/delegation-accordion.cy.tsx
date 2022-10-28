import { DelegationAccordion } from '../../src/components/DelegationOverviewPage/DelegationAccordion/DelegationAccordion';

describe('DelegationAccordion', () => {
  it('playground', () => {
    const org = {
      id: 1,
      apiName: 'Delegert API A',
      organizations: [
        { id: 2, name: 'Virksomhet 1', isSoftDelete: false },
        { id: 3, name: 'Virksomhet 2', isSoftDelete: false },
        { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
      ],
    };
    const setOrganizationsArray = (
      apiID: number,
      newArray: Array<{ id: number; name: string; isSoftDelete: boolean }>,
    ) => {
      const newDelegations = [org];
      for (const api of newDelegations) {
        if (api.id === apiID) {
          api.organizations = newArray;
        }
      }
    };
    cy.mount(
      <DelegationAccordion
        key={org.id}
        name={org.apiName}
        apiId={org.id}
        organizations={org.organizations}
        setOrganizations={setOrganizationsArray}
      />,
    );
    cy.get('button').first().click();
    cy.get('li').first().findByRole('button').click();
  });
});

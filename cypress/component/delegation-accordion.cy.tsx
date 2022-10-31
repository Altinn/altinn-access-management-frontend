import * as cypress from '@testing-library/cypress';

import { ApiDelegationAccordion } from '../../src/components/ApiDelegationOverviewPage/ApiDelegationAccordion/ApiDelegationAccordion';

describe('DelegationAccordion Header', () => {
  it('should show delete button when it contains orgs that are not soft deleted', () => {
    const orgs = [
      { id: 1, name: 'Virksomhet 1', isSoftDelete: false },
      { id: 2, name: 'Virksomhet 2', isSoftDelete: false },
      { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
    ];
    const updateOrgs = (
      newArray: Array<{
        id: number;
        name: string;
        isSoftDelete: boolean;
      }>,
    ) => {
      cy.stub();
    };

    cy.mount(
      <ApiDelegationAccordion
        name='API A'
        organizations={orgs}
        setOrganizations={updateOrgs}
      />,
    );
    cy.findByRole('button', { name: /Slett/i }).should('exist');
  });
  it('should show a regret button and display header with line through when all orgs are soft deleted', () => {
    const orgs = [
      { id: 1, name: 'Virksomhet 1', isSoftDelete: true },
      { id: 2, name: 'Virksomhet 2', isSoftDelete: true },
      { id: 4, name: 'Virksomhet 3', isSoftDelete: true },
    ];
    const updateOrgs = (
      newArray: Array<{
        id: number;
        name: string;
        isSoftDelete: boolean;
      }>,
    ) => {
      cy.stub();
    };

    cy.mount(
      <ApiDelegationAccordion
        name='API A'
        organizations={orgs}
        setOrganizations={updateOrgs}
      />,
    );

    cy.get('button').contains('API A').should('have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');
    cy.findByRole('button', { name: /Angre/i }).should('exist');
  });
  it('should call update function on button click', () => {
    const orgs = [
      { id: 1, name: 'Virksomhet 1', isSoftDelete: true },
      { id: 2, name: 'Virksomhet 2', isSoftDelete: false },
      { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
    ];
    const updateOrgs = (
      newArray: Array<{
        id: number;
        name: string;
        isSoftDelete: boolean;
      }>,
    ) => {
      cy.stub();
    };

    const updateOrgsSpy = cy.spy(updateOrgs).as('updateOrgsSpy');

    cy.mount(
      <ApiDelegationAccordion
        name='API A'
        organizations={orgs}
        setOrganizations={updateOrgsSpy}
      />,
    );

    cy.findByRole('button', { name: /Slett/i }).click();
    cy.get('@updateOrgsSpy').should('have.been.called');
  });
});

describe('DelegationAccordion Content', () => {
  it('should display which orgs that are currently set as soft delete', () => {
    const orgs = [
      { id: 1, name: 'Virksomhet 1', isSoftDelete: true },
      { id: 2, name: 'Virksomhet 2', isSoftDelete: false },
      { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
    ];
    const updateOrgs = (
      newArray: Array<{
        id: number;
        name: string;
        isSoftDelete: boolean;
      }>,
    ) => {
      cy.stub();
    };

    cy.mount(
      <ApiDelegationAccordion
        name='API A'
        organizations={orgs}
        setOrganizations={updateOrgs}
      />,
    );

    cy.findByRole('button', { name: /API A/i }).click();
    cy.get('li').first().findByRole('button', { name: /Angre/i }).should('exist');
    cy.get('li').contains('Virksomhet 1').should('have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');

    cy.get('li').eq(1).findByRole('button', { name: /Slett/i }).should('exist');
    cy.get('li').contains('Virksomhet 2').should('not.have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');
  });
  it('should call update function on button click', () => {
    const orgs = [
      { id: 1, name: 'Virksomhet 1', isSoftDelete: false },
      { id: 2, name: 'Virksomhet 2', isSoftDelete: false },
      { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
    ];
    const updateOrgs = (
      newArray: Array<{
        id: number;
        name: string;
        isSoftDelete: boolean;
      }>,
    ) => {
      cy.stub();
    };

    const updateOrgsSpy = cy.spy(updateOrgs).as('updateOrgsSpy');

    cy.mount(
      <ApiDelegationAccordion
        name='API A'
        organizations={orgs}
        setOrganizations={updateOrgsSpy}
      />,
    );

    cy.findByRole('button', { name: /API A/i }).click();
    cy.get('li').first().findByRole('button', { name: /Slett/i }).click();
    cy.get('@updateOrgsSpy').should('have.been.called');
  });
});

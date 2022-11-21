import * as cypress from '@testing-library/cypress';
import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';

import { OrgDelegationAccordion } from '@/components/ApiDelegationOverviewPage/OrgDelegationOverviewPageContent/OrgDelegationAccordion/OrgDelegationAccordion';
import type { OverviewOrg } from '@/rtk/features/overviewOrg/overviewOrgSlice';
import store from '@/rtk/app/store';

Cypress.Commands.add('mount', (component, options = {}) => {
  // Use the default store if one is not provided
  const { reduxStore = store, ...mountOptions } = options;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

describe('OrgDelegationAccordion', () => {
  describe('AccordionHeader', () => {
    it('should show edit button on render', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        listItems: [
          {
            id: '1',
            name: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            name: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      const softUndoAll = () => {
        cy.stub();
      };

      const softUndoAllSpy = cy.spy(softUndoAll).as('softUndoAllSpy');

      const softDeleteAll = () => {
        cy.stub();
      };

      const softDeleteAllSpy = cy.spy(softDeleteAll).as('softDeleteAllSpy');

      cy.mount(
        <OrgDelegationAccordion
          softUndoAllCallback={softUndoAllSpy}
          softDeleteAllCallback={softDeleteAllSpy}
          organization={overviewOrgs}
          isEditable={false}
        />,
      );
      cy.findByRole('button', { name: /api_delegation.delegate_new_api/i }).should('exist');
    });

    it('should show delete button when state is isEditable', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        listItems: [
          {
            id: '1',
            name: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            name: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      const softUndoAll = () => {
        cy.stub();
      };

      const softUndoAllSpy = cy.spy(softUndoAll).as('softUndoAllSpy');

      const softDeleteAll = () => {
        cy.stub();
      };

      const softDeleteAllSpy = cy.spy(softDeleteAll).as('softDeleteAllSpy');

      cy.mount(
        <OrgDelegationAccordion
          softUndoAllCallback={softUndoAllSpy}
          softDeleteAllCallback={softDeleteAllSpy}
          organization={overviewOrgs}
          isEditable={true}
        />,
      );
      cy.findByRole('button', { name: /delete/i }).should('exist');
    });

    it('should show an undo button and display header with line through when all apis are soft deleted', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: true,
        orgNr: '123456789',
        listItems: [
          {
            id: '1',
            name: 'Delegert API A',
            isSoftDelete: true,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            name: 'Delegert API B',
            isSoftDelete: true,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };
      const softUndoAll = () => {
        cy.stub();
      };

      const softUndoAllSpy = cy.spy(softUndoAll).as('softUndoAllSpy');

      const softDeleteAll = () => {
        cy.stub();
      };

      const softDeleteAllSpy = cy.spy(softDeleteAll).as('softDeleteAllSpy');

      cy.mount(
        <OrgDelegationAccordion
          softUndoAllCallback={softUndoAllSpy}
          softDeleteAllCallback={softDeleteAllSpy}
          organization={overviewOrgs}
          isEditable={true}
        />,
      );

      cy.get('button')
        .contains('Evry')
        .should('have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');
      cy.findByRole('button', { name: /undo/i }).should('exist');
    });

    it('should call update function on button click', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        listItems: [
          {
            id: '1',
            name: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            name: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      const softUndoAll = () => {
        cy.stub();
      };

      const softUndoAllSpy = cy.spy(softUndoAll).as('softUndoAllSpy');

      const softDeleteAll = () => {
        cy.stub();
      };

      const softDeleteAllSpy = cy.spy(softDeleteAll).as('softDeleteAllSpy');

      cy.mount(
        <OrgDelegationAccordion
          organization={overviewOrgs}
          softDeleteAllCallback={softDeleteAllSpy}
          softUndoAllCallback={softUndoAllSpy}
        />,
      );

      cy.findByRole('button', { name: /Slett/i }).click();
      cy.get('@updateOrgsSpy').should('have.been.called');
    });
  });

  describe('AccordionContent', () => {
    it('should display which orgs that are currently set as soft delete', () => {
      const orgs = [
        { id: 1, name: 'Virksomhet 1', isSoftDelete: true },
        { id: 2, name: 'Virksomhet 2', isSoftDelete: false },
        { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
      ];
      const updateOrgs = (
        newOrgArray: Array<{
          id: number;
          name: string;
          isSoftDelete: boolean;
        }>,
      ) => {
        cy.stub();
      };

      cy.mount(
        <OrgDelegationAccordion
          name='API A'
          organizations={orgs}
          setOrganizations={updateOrgs}
        />,
      );

      cy.findByRole('button', { name: /API A/i }).click();
      cy.get('li').first().findByRole('button', { name: /Angre/i }).should('exist');
      cy.get('li')
        .contains('Virksomhet 1')
        .should('have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');

      cy.get('li').eq(1).findByRole('button', { name: /Slett/i }).should('exist');
      cy.get('li')
        .contains('Virksomhet 2')
        .should('not.have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');
    });
    it('should call update function on button click', () => {
      const orgs = [
        { id: 1, name: 'Virksomhet 1', isSoftDelete: false },
        { id: 2, name: 'Virksomhet 2', isSoftDelete: false },
        { id: 4, name: 'Virksomhet 3', isSoftDelete: false },
      ];
      const updateOrgs = (
        newOrgArray: Array<{
          id: number;
          name: string;
          isSoftDelete: boolean;
        }>,
      ) => {
        cy.stub();
      };

      const updateOrgsSpy = cy.spy(updateOrgs).as('updateOrgsSpy');

      cy.mount(
        <OrgDelegationAccordion
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
});

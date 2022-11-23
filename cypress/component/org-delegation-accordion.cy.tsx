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
    it('should show delegateNewApi-button on render', () => {
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

    it('should show delete button when state is isEditable=true', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        listItems: [],
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

    it('should not show undo button when state is isEditable=false and isAllSoftDeleted=false', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        listItems: [],
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
      cy.findByRole('button', { name: /api_delegation.undo/i }).should('not.exist');
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

    it('should call softDeleteCallback on button click and isEditable=true ', () => {
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
          isEditable={true}
        />,
      );

      cy.findByRole('button', { name: /delete/i }).click();
      cy.get('@softDeleteAllSpy').should('have.been.called');
    });

    it('should call softUndoCallback on buttonclick', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        name: 'Evry',
        isAllSoftDeleted: true,
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
          isEditable={false}
        />,
      );

      cy.findByRole('button', { name: /undo/i }).click();
      cy.get('@softUndoAllSpy').should('have.been.called');
    });
  });
});

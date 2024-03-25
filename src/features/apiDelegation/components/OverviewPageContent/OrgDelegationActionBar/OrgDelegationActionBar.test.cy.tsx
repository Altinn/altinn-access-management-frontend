import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import * as React from 'react';

import { OrgDelegationActionBar } from '@/features/apiDelegation/components/OverviewPageContent/OrgDelegationActionBar';
import store from '@/rtk/app/store';

import type { OverviewOrg } from '@/rtk/features/apiDelegation/apiDelegation/overviewOrg/overviewOrgSlice';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

describe('OrgDelegationActionBar', () => {
  describe('AccordionHeader', () => {
    it('should show delegateNewApi-button on render when delegateToOrgCallback is set', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        apiList: [
          {
            id: '1',
            apiName: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            apiName: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
          delegateToOrgCallback={() => null}
        />,
      );
      cy.findByRole('button', { name: /api_delegation.delegate_new_api/i }).should('exist');
    });

    it('should not show delegateNewApi-button on render when delegateToOrgCallback is not set', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        apiList: [
          {
            id: '1',
            apiName: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            apiName: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
        />,
      );
      cy.findByRole('button', { name: /api_delegation.delegate_new_api/i }).should('not.exist');
    });

    it('should show delete button when state isEditable=true', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        apiList: [],
      };

      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={true}
        />,
      );
      cy.findByRole('button', { name: /delete/i }).should('exist');
    });

    it('should not show undo button when state is isEditable=false', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        apiList: [],
      };

      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
        />,
      );
      cy.findByRole('button', { name: /undo/i }).should('not.exist');
    });

    it('should show an undo button and display header with line through when all apis are soft deleted', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: true,
        orgNr: '123456789',
        apiList: [
          {
            id: '1',
            apiName: 'Delegert API A',
            isSoftDelete: true,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            apiName: 'Delegert API B',
            isSoftDelete: true,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={true}
        />,
      );

      cy.get('button')
        .contains('Evry')
        .should('have.css', 'text-decoration', 'line-through solid rgb(30, 43, 60)');
      cy.findByRole('button', { name: /undo/i }).should('exist');
    });

    it('should call softDeleteAllCallback on buttonclick when isEditable=true ', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: false,
        orgNr: '123456789',
        apiList: [
          {
            id: '1',
            apiName: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            apiName: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      const softDeleteAll = () => {
        cy.stub();
      };

      const softDeleteAllSpy = cy.spy(softDeleteAll).as('softDeleteAllSpy');

      cy.mount(
        <OrgDelegationActionBar
          organization={overviewOrgs}
          softDeleteAllCallback={softDeleteAllSpy}
          softRestoreAllCallback={() => null}
          isEditable={true}
        />,
      );

      cy.findByRole('button', { name: /delete/i }).click();
      cy.get('@softDeleteAllSpy').should('have.been.called');
    });

    it('should call softRestoreCallback on buttonclick', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: true,
        orgNr: '123456789',
        apiList: [
          {
            id: '1',
            apiName: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            apiName: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      const softRestoreAll = () => {
        cy.stub();
      };

      const softRestoreAllSpy = cy.spy(softRestoreAll).as('softRestoreAllSpy');

      cy.mount(
        <OrgDelegationActionBar
          organization={overviewOrgs}
          softDeleteAllCallback={() => null}
          softRestoreAllCallback={softRestoreAllSpy}
          isEditable={true}
        />,
      );

      cy.findByRole('button', { name: /undo/i }).click();
      cy.get('@softRestoreAllSpy').should('have.been.called');
    });

    it('should call delegateToOrgCallback on buttonclick', () => {
      const overviewOrgs: OverviewOrg = {
        id: '1',
        orgName: 'Evry',
        isAllSoftDeleted: true,
        orgNr: '123456789',
        apiList: [
          {
            id: '1',
            apiName: 'Delegert API A',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
          {
            id: '2',
            apiName: 'Delegert API B',
            isSoftDelete: false,
            owner: 'Accenture',
            description:
              'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
          },
        ],
      };

      const delegateToNewOrg = () => {
        cy.stub();
      };

      const delegateToNewOrgSpy = cy.spy(delegateToNewOrg).as('delegateToNewOrgSpy');

      cy.mount(
        <OrgDelegationActionBar
          organization={overviewOrgs}
          softDeleteAllCallback={() => null}
          softRestoreAllCallback={() => null}
          delegateToOrgCallback={delegateToNewOrgSpy}
          isEditable={true}
        />,
      );

      cy.findByRole('button', { name: /delegate_new_api/i }).click();
      cy.get('@delegateToNewOrgSpy').should('have.been.called');
    });
  });
});

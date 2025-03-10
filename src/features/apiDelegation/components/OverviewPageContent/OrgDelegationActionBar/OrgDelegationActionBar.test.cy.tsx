import { Provider } from 'react-redux';
import { mount } from 'cypress/react';
import * as React from 'react';

import { OrgDelegationActionBar } from '@/features/apiDelegation/components/OverviewPageContent/OrgDelegationActionBar';
import store from '@/rtk/app/store';
import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgApi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MountReactComponentOptions = Record<string, any>;
Cypress.Commands.add(
  'mount',
  (component: React.ReactNode, options: MountReactComponentOptions = {}) => {
    const { reduxStore = store, ...mountOptions } = options;

    const wrapped = <Provider store={reduxStore}>{component}</Provider>;

    return mount(wrapped, mountOptions);
  },
);

const overviewOrgs: OverviewOrg = {
  id: '1',
  name: 'Evry',
  orgNumber: '123456789',
  apiList: [
    {
      id: '1',
      apiName: 'Delegert API A',
      scopes: ['some-scope'],
      owner: 'Accenture',
      description:
        'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
    },
    {
      id: '2',
      apiName: 'Delegert API B',
      scopes: ['some-other-scope'],
      owner: 'Accenture',
      description:
        'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
    },
  ],
};

const deletedOverviewOrgs: OverviewOrg = {
  id: '1',
  name: 'Evry',
  orgNumber: '123456789',
  apiList: [
    {
      id: '1',
      apiName: 'Delegert API A',
      scopes: ['some-scope'],
      owner: 'Accenture',
      description:
        'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
    },
    {
      id: '2',
      apiName: 'Delegert API B',
      scopes: ['some-other-scope'],
      owner: 'Accenture',
      description:
        'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
    },
  ],
};

describe('OrgDelegationActionBar', () => {
  describe('AccordionHeader', () => {
    it("should render the ActionBar with the organization's correct information", () => {
      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
          delegateToOrgCallback={() => null}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );
      cy.contains(overviewOrgs.name);
      cy.contains('common.org_nr' + ' ' + overviewOrgs.orgNumber);
      cy.contains(overviewOrgs.name).click(); // open the bar to check the content information
      cy.contains(overviewOrgs.apiList[0].apiName);
      cy.contains(overviewOrgs.apiList[0].description);
      cy.contains(overviewOrgs.apiList[0].owner);
      cy.contains(overviewOrgs.apiList[0].scopes[0]);
    });
    it('should show delegateNewApi-button on render when delegateToOrgCallback is set', () => {
      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
          delegateToOrgCallback={() => null}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );
      cy.findByRole('button', { name: /api_delegation.delegate_new_api/i }).should('exist');
    });

    it('should not show delegateNewApi-button on render when delegateToOrgCallback is not set', () => {
      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );
      cy.findByRole('button', { name: /api_delegation.delegate_new_api/i }).should('not.exist');
    });

    it('should show delete button when state isEditable=true', () => {
      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={true}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );
      cy.findByRole('button', { name: /delete/i }).should('exist');
    });

    it('should not show undo button when state is isEditable=false', () => {
      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={overviewOrgs}
          isEditable={false}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );
      cy.findByRole('button', { name: /undo/i }).should('not.exist');
    });

    it('should show an undo button and display header with line through when all apis are soft deleted', () => {
      cy.mount(
        <OrgDelegationActionBar
          softRestoreAllCallback={() => null}
          softDeleteAllCallback={() => null}
          organization={deletedOverviewOrgs}
          isEditable={true}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => true}
          checkIfAllItmesAreSoftDeleted={() => true}
        />,
      );

      cy.get('button')
        .contains('Evry')
        .should('have.css', 'text-decoration', 'line-through solid rgb(0, 0, 0)');
      cy.findByRole('button', { name: /undo/i }).should('exist');
    });

    it('should call softDeleteAllCallback on buttonclick when isEditable=true ', () => {
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
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );

      cy.findByRole('button', { name: /delete/i }).click();
      cy.get('@softDeleteAllSpy').should('have.been.called');
    });

    it('should call softRestoreCallback on buttonclick', () => {
      const softRestoreAll = () => {
        cy.stub();
      };

      const softRestoreAllSpy = cy.spy(softRestoreAll).as('softRestoreAllSpy');

      cy.mount(
        <OrgDelegationActionBar
          organization={deletedOverviewOrgs}
          softDeleteAllCallback={() => null}
          softRestoreAllCallback={softRestoreAllSpy}
          isEditable={true}
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => true}
          checkIfAllItmesAreSoftDeleted={() => true}
        />,
      );

      cy.findByRole('button', { name: /undo/i }).click();
      cy.get('@softRestoreAllSpy').should('have.been.called');
    });

    it('should call delegateToOrgCallback on buttonclick', () => {
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
          setScreenreaderMsg={() => null}
          softRestoreCallback={() => null}
          softDeleteCallback={() => null}
          checkIfItemIsSoftDeleted={() => false}
          checkIfAllItmesAreSoftDeleted={() => false}
        />,
      );

      cy.findByRole('button', { name: /delegate_new_api/i }).click();
      cy.get('@delegateToNewOrgSpy').should('have.been.called');
    });
  });
});

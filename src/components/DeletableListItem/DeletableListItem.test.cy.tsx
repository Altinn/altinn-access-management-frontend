import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { List } from '@digdir/design-system-react';
import * as React from 'react';

import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import store from '@/rtk/app/store';
import { DeletableListItem } from '@/components';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

describe('DeletableListItem', () => {
  it('should show delete button when state isEditable=true', () => {
    const overviewOrg: OverviewOrg = {
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
      ],
    };

    cy.mount(
      <List>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={true}
        />
      </List>,
    );
    cy.findByRole('button', { name: /delete/i }).should('exist');
  });

  it('should not show delete button when state isEditable=false', () => {
    const overviewOrg: OverviewOrg = {
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
      ],
    };

    cy.mount(
      <List>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={false}
        />
      </List>,
    );
    cy.findByRole('button', { name: /delete/i }).should('not.exist');
  });

  it('should show an undo button and display list item texts with line through when state isEditable=true', () => {
    const overviewOrg: OverviewOrg = {
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
      ],
    };

    cy.mount(
      <List>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={true}
        />
      </List>,
    );

    cy.get('[data-testid="list-item-texts"]').should(
      'have.css',
      'text-decoration',
      'line-through solid rgb(30, 43, 60)',
    );
    cy.findByRole('button', { name: /undo/i }).should('exist');
  });

  it('should do softDeleteCallback on button click', () => {
    const overviewOrg: OverviewOrg = {
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
      ],
    };

    const softDelete = () => {
      cy.stub();
    };

    const softDeleteSpy = cy.spy(softDelete).as('softDeleteSpy');

    cy.mount(
      <List>
        <DeletableListItem
          softDeleteCallback={softDeleteSpy}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={true}
        />
      </List>,
    );

    cy.findByRole('button', { name: /delete/i }).click();
    cy.get('@softDeleteSpy').should('have.been.called');
  });

  it('should do softRestoreCallback on button click', () => {
    const overviewOrg: OverviewOrg = {
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
      ],
    };

    const softRestore = () => {
      cy.stub();
    };

    const softRestoreSpy = cy.spy(softRestore).as('softRestoreSpy');

    cy.mount(
      <List>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={softRestoreSpy}
          item={overviewOrg.apiList[0]}
          isEditable={true}
        />
      </List>,
    );

    cy.findByRole('button', { name: /undo/i }).click();
    cy.get('@softRestoreSpy').should('have.been.called');
  });
});

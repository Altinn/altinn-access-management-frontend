import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import * as React from 'react';

import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import store from '@/rtk/app/store';
import { DeletableListItem, BorderedList } from '@/components';

const overviewOrg: OverviewOrg = {
  id: '1',
  name: 'Evry',
  isAllSoftDeleted: false,
  orgNumber: '123456789',
  apiList: [
    {
      id: '1',
      apiName: 'Delegert API A',
      isSoftDelete: false,
      owner: 'Accenture',
      scopes: ['some-scope'],
      description:
        'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
    },
  ],
};

const deletedListItem = {
  id: '1',
  apiName: 'Delegert API A',
  isSoftDelete: true,
  owner: 'Accenture',
  scopes: ['some-scope'],
  description:
    'API for forvaltningsorgan og kompetansesenter som skal styrke kommunenes, sektormyndighetenes og andre samarbeidspartneres kompetanse på integrering og',
};

describe('DeletableListItem', () => {
  it('should show delete button when state isEditable=true', () => {
    cy.mount(
      <BorderedList>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={true}
        />
      </BorderedList>,
    );
    cy.findByRole('button', { name: /delete/i }).should('exist');
  });

  it('should not show delete button when state isEditable=false', () => {
    cy.mount(
      <BorderedList>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={false}
        />
      </BorderedList>,
    );
    cy.findByRole('button', { name: /delete/i }).should('not.exist');
  });

  it('should show an undo button and display list item texts with line through when state isEditable=true', () => {
    cy.mount(
      <BorderedList>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={() => null}
          item={deletedListItem}
          isEditable={true}
        />
      </BorderedList>,
    );

    cy.get('[data-testid="list-item-texts"]')
      .should('have.css', 'text-decoration')
      .and('include', 'line-through');

    cy.findByRole('button', { name: /undo/i }).should('exist');
  });

  it('should do softDeleteCallback on button click', () => {
    const softDelete = () => {
      cy.stub();
    };

    const softDeleteSpy = cy.spy(softDelete).as('softDeleteSpy');

    cy.mount(
      <BorderedList>
        <DeletableListItem
          softDeleteCallback={softDeleteSpy}
          softRestoreCallback={() => null}
          item={overviewOrg.apiList[0]}
          isEditable={true}
        />
      </BorderedList>,
    );

    cy.findByRole('button', { name: /delete/i }).click();
    cy.get('@softDeleteSpy').should('have.been.called');
  });

  it('should do softRestoreCallback on button click', () => {
    const softRestore = () => {
      cy.stub();
    };

    const softRestoreSpy = cy.spy(softRestore).as('softRestoreSpy');

    cy.mount(
      <BorderedList>
        <DeletableListItem
          softDeleteCallback={() => null}
          softRestoreCallback={softRestoreSpy}
          item={deletedListItem}
          isEditable={true}
        />
      </BorderedList>,
    );

    cy.findByRole('button', { name: /undo/i }).click();
    cy.get('@softRestoreSpy').should('have.been.called');
  });
});

import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { List } from '@digdir/design-system-react';
import * as React from 'react';

import store from '@/rtk/app/store';
import { CompactDeletableListItem } from '@/components';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

describe('CompactDeletableListItem', () => {
  it('should not show delete button when removeCallback is not set', () => {
    cy.mount(
      <List>
        <CompactDeletableListItem
          leftText={'Api'}
          middleText={'Skattetaten'}
        />
      </List>,
    );
    cy.findByRole('button', { name: /delete/i }).should('not.exist');
  });

  it('should show delete button when removeCallback has value ', () => {
    cy.mount(
      <List>
        <CompactDeletableListItem
          removeCallback={() => null}
          leftText={'Api'}
          middleText={'Skattetaten'}
        />
      </List>,
    );
    cy.findByRole('button', { name: /remove/i }).should('exist');
  });

  it('should do removeCallback on button click', () => {
    const softRemove = () => {
      cy.stub();
    };

    const softRemoveSpy = cy.spy(softRemove).as('softRemoveSpy');

    cy.mount(
      <List>
        <CompactDeletableListItem
          removeCallback={softRemoveSpy}
          leftText={'Api'}
          middleText={'Org'}
        />
      </List>,
    );
  });
});

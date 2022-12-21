import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { List } from '@altinn/altinn-design-system';

import store from '@/rtk/app/store';
import { CompactDeletableListItem } from '@/components/Reusables/CompactDeletableListItem';

Cypress.Commands.add('mount', (component, options = {}) => {
  const { reduxStore = store, ...mountOptions } = options;

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
    cy.findByRole('button', { name: /delete/i }).should('exist');
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

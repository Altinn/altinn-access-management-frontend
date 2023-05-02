import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import * as React from 'react';

import store from '@/rtk/app/store';
import { ActionBar, type ActionBarProps } from '@/components/reusables';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const expandableActionBar = (props: Partial<ActionBarProps> = {}) => (
  <ActionBar
    additionalText={<div>AdditionalText</div>}
    subtitle={<div>Subtitle</div>}
    title={<div>Title</div>}
    {...props}
  >
    Expandable
  </ActionBar>
);

const nonExpandableActionBar = (props: Partial<ActionBarProps> = {}) => (
  <ActionBar
    additionalText={<div>additionalText</div>}
    subtitle={<div>Subtitle</div>}
    title={<div>Tubtitle</div>}
    {...props}
  />
);

describe('ActionBar', () => {
  it('should not render chevron when non expandable ActionBar is rendered ', () => {
    cy.mount(nonExpandableActionBar());
    cy.get('[data-testid="action-bar-icon"]').should('not.exist');
  });

  it('should call handleClick when expandable ActionBar is clicked by mouse', () => {
    const handleClick = () => {
      cy.stub();
    };

    const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

    cy.mount(expandableActionBar({ onClick: handleClickSpy }));
    cy.get('[data-testid="action-bar"]').click();

    cy.get('@handleClickSpy').should('have.been.called');
  });

  it('should call handleClick when expandable ActionBar is clicked by space', () => {
    const handleClick = () => {
      cy.stub();
    };

    const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

    cy.mount(expandableActionBar({ onClick: handleClickSpy }));
    cy.get('[data-testid="action-bar"]').type(' ');
    cy.get('@handleClickSpy').should('have.been.called');
  });

  it('should call handleClick when expandable ActionBar is clicked by enter', () => {
    const handleClick = () => {
      cy.stub();
    };

    const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

    cy.mount(expandableActionBar({ onClick: handleClickSpy }));
    cy.get('[data-testid="action-bar"]').type('{enter}');
    cy.get('@handleClickSpy').should('have.been.called');
  });

  it('should not call handleClick when non expandable ActionBar is clicked', () => {
    const handleClick = () => {
      cy.stub();
    };

    const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

    const handleActionClick = () => {
      cy.stub();
    };

    const handleActionClickSpy = cy.spy(handleActionClick).as('handleActionClickSpy');

    cy.mount(nonExpandableActionBar({ onClick: handleClickSpy }));

    cy.get('[data-testid="action-bar"]').click();
    cy.get('@handleClickSpy').should('have.been.called');
  });

  it('should only call handleActionClick when non ActionBar is clicked', () => {
    const handleClick = () => {
      cy.stub();
    };

    const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

    const handleActionClick = () => {
      cy.stub();
    };

    const handleActionClickSpy = cy.spy(handleActionClick).as('handleActionClickSpy');

    const actionButton = <Button onClick={handleActionClickSpy}>Action</Button>;

    cy.mount(nonExpandableActionBar({ actions: actionButton }));

    cy.findByRole('button', { name: /Action/i }).click();
    cy.get('@handleActionClickSpy').should('have.been.called');
  });

  it('should have aria-expanded=false when open=false', () => {
    cy.mount(expandableActionBar({ open: false }));
    cy.get('[data-testid="action-bar"]').should('have.attr', 'aria-expanded', 'false');
  });

  it('should have aria-expanded=true when open=true', () => {
    cy.mount(expandableActionBar({ open: true }));
    cy.get('[data-testid="action-bar"]').should('have.attr', 'aria-expanded', 'true');
  });

  it('should call handleClick when ActionBar is clicked using key press Space', () => {
    const handleClick = () => {
      cy.stub();
    };

    cy.spy(handleClick).as('handleClickSpy');

    cy.mount(expandableActionBar({ onClick: handleClick }));

    // Press space to trigger click event
    cy.get('[data-testid="action-bar"]').click();

    /* .focus()
      .type(' ') 
      .click(); */
    cy.get('@handleClickSpy').should('have.been.called');
  });
});

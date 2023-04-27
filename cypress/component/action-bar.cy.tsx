import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import * as React from 'react';

import type { OverviewOrg } from '@/rtk/features/apiDelegation/overviewOrg/overviewOrgSlice';
import store from '@/rtk/app/store';
import { ActionBar } from '@/components/reusables';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const actionCallback = () => {
  cy.stub();
};

const onClickCallback = () => {
  cy.stub();
};

const actionCallbackSpy = cy.spy(actionCallback).as('actionCallbackSpy');

const onClickCallbackSpy = cy.spy(onClickCallback).as('onClickCallbackSpy');

const expandableActionBar = () => {
  <ActionBar
    actions={
      <Button
        variant={ButtonVariant.Quiet}
        color={ButtonColor.Danger}
        onClick={actionCallbackSpy}
        aria-label={'remove'}
      >
        Action
      </Button>
    }
    additionalText={<div>additionalText</div>}
    onClick={onClickCallbackSpy}
    subtitle={<div>subtitle</div>}
    title={<div>subtitle</div>}
  >
    Expandable
  </ActionBar>;
};

const nonExpandableActionBar = () => {
  <ActionBar
    actions={
      <Button
        variant={ButtonVariant.Quiet}
        color={ButtonColor.Danger}
        aria-label={'remove'}
      >
        Action
      </Button>
    }
    additionalText={<div>additionalText</div>}
    onClick={onClickCallbackSpy}
    subtitle={<div>subtitle</div>}
    title={<div>subtitle</div>}
  />;
};

describe('DeletableListItem', () => {
  it('should call handleClick when ActionBar is clicked', () => {
    cy.mount(expandableActionBar);
    cy.get('[data-testid="action-bar"]').click();
  });

  it('should not call handleClick when ActionBar is clicked ', () => {
    cy.mount();
    cy.get('[data-testid="action-bar"]').click();
  });
});

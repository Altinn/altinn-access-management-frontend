import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import * as React from 'react';

import store from '@/rtk/app/store';
import { DelegationActionBar } from '@/components';

import type { DelegableOrg } from '@/rtk/features/apiDelegation/apiDelegation/delegableOrg/delegableOrgSlice';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const delegableOrg: DelegableOrg = {
  id: '1',
  orgName: 'Skatteetaten',
  orgNr: '930124123',
};

describe('DelegationActionBar', () => {
  it('should do callback when button with aria-label "soft-add" is clicked', () => {
    const callback = () => {
      cy.stub();
    };

    const callbackSpy = cy.spy(callback).as('callbackSpy');

    cy.mount(
      <DelegationActionBar
        title={delegableOrg.orgName}
        subtitle={delegableOrg.orgNr}
        buttonType={'add'}
        onActionButtonClick={callbackSpy}
      ></DelegationActionBar>,
    );

    cy.get('button[aria-label*="add"]').click();
    cy.get('@callbackSpy').should('have.been.called');
  });

  it('should do callback when button when aria-label "remove" is clicked', () => {
    const callback = () => {
      cy.stub();
    };

    const callbackSpy = cy.spy(callback).as('callbackSpy');

    cy.mount(
      <DelegationActionBar
        title={delegableOrg.orgName}
        subtitle={delegableOrg.orgNr}
        buttonType={'remove'}
        onActionButtonClick={callbackSpy}
      ></DelegationActionBar>,
    );

    cy.get('button[aria-label*="remove"]').click();
    cy.get('@callbackSpy').should('have.been.called');
  });
});

import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import * as React from 'react';

import store from '@/rtk/app/store';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { NewDelegationAccordion, NewDelegationAccordionButtonType } from '@/components/reusables';

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
  description: 'For å hente ut skatteklasser',
};

describe('NewDelegationAccordion', () => {
  it('should do callback when button with aria-label "soft-add" is clicked', () => {
    const callback = () => {
      cy.stub();
    };

    const callbackSpy = cy.spy(callback).as('callbackSpy');

    cy.mount(
      <NewDelegationAccordion
        title={delegableOrg.orgName}
        subtitle={delegableOrg.orgNr}
        buttonType={NewDelegationAccordionButtonType.Add}
        addRemoveClick={callbackSpy}
      ></NewDelegationAccordion>,
    );

    cy.findByLabelText(/soft-add/i).click();
    cy.get('@callbackSpy').should('have.been.called');
  });

  it('should do callback when button with aria-label "soft-remove" is clicked', () => {
    const callback = () => {
      cy.stub();
    };

    const callbackSpy = cy.spy(callback).as('callbackSpy');

    cy.mount(
      <NewDelegationAccordion
        title={delegableOrg.orgName}
        subtitle={delegableOrg.orgNr}
        buttonType={NewDelegationAccordionButtonType.Remove}
        addRemoveClick={callbackSpy}
      ></NewDelegationAccordion>,
    );

    cy.findByLabelText(/soft-remove/i).click();
    cy.get('@callbackSpy').should('have.been.called');
  });
});

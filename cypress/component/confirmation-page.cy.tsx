import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { Button } from '@altinn/altinn-design-system';

import store from '@/rtk/app/store';
import { ConfirmationPage } from '@/components/Reusables/ConfirmationPage';
import type { DelegableApi } from '@/rtk/features/delegableApi/delegableApiSlice';
import type { DelegableOrg } from '@/rtk/features/delegableOrg/delegableOrgSlice';
import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';

Cypress.Commands.add('mount', (component, options = {}) => {
  const { reduxStore = store, ...mountOptions } = options;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const delegableApiList: DelegableApi[] = [
  {
    id: '1',
    apiName: 'Api',
    orgName: 'Org',
    description: 'Description',
  },
];

const delegableOrgList: DelegableOrg[] = [
  {
    id: '1',
    orgName: 'Org',
    orgNr: '123',
    description: 'Description',
  },
];

describe('ConfirmationPage', () => {
  it('should not show buttons when not supplied to component', () => {
    cy.mount(
      <ConfirmationPage
        apiList={delegableApiList}
        orgList={delegableOrgList}
        pageHeaderText={'Confirmation Page'}
        apiListContentHeader={'Text'}
        orgListContentHeader={'Text'}
        bottomText={'Text'}
        headerIcon={<MinusCircle />}
      />,
    );
    cy.findByRole('button').should('not.exist');
  });

  it('should show mainButton and complementaryButton when these props are supplied to component', () => {
    cy.mount(
      <ConfirmationPage
        apiList={delegableApiList}
        orgList={delegableOrgList}
        pageHeaderText={'Confirmation Page'}
        apiListContentHeader={'Text'}
        orgListContentHeader={'Text'}
        mainButton={<Button>MainButton</Button>}
        complementaryButton={<Button>ComplementaryButton</Button>}
        bottomText={'Text'}
        headerIcon={<MinusCircle />}
      />,
    );
    cy.findByRole('button', { name: /MainButton/i }).should('exist');
    cy.findByRole('button', { name: /ComplementaryButton/i }).should('exist');
  });
});

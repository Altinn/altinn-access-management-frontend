import { Provider } from 'react-redux';
import { mount } from 'cypress/react';
import * as React from 'react';
import { Button } from '@digdir/designsystemet-react';

import store from '@/rtk/app/store';
import { Dialog, DialogContent, type DialogProps } from '@/components';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const dialog = (props: Partial<DialogProps> = {}) => (
  <Dialog
    open={true}
    {...props}
  >
    <DialogContent>Dialog beskrivelse</DialogContent>
  </Dialog>
);

describe('Dialog', () => {
  it('should render correctly', () => {
    cy.mount(dialog());

    cy.get('[role="dialog"]').should('exist');
    cy.get('[role="dialog"]').invoke('attr', 'id').should('exist');
  });

  it('should call onOpenChange when set', () => {
    const handleClick = () => {
      cy.stub();
    };
    const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

    cy.mount(
      <Dialog
        open={true}
        onOpenChange={handleClickSpy}
      >
        <DialogContent>
          Dialog innhold
          <Button onClick={handleClickSpy}>Knapp</Button>
        </DialogContent>
      </Dialog>,
    );

    cy.get('[type="button"]').click();
    cy.get('@handleClickSpy').should('have.been.called');
  });
});

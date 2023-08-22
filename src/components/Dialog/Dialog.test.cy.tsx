import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import * as React from 'react';
import { Button } from '@digdir/design-system-react';

import store from '@/rtk/app/store';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeading,
  type DialogProps,
} from '@/components';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const dialog = (props: Partial<DialogProps> = {}) => (
  <Dialog {...props}>
    <DialogContent>
      <DialogDescription>Dialog beskrivelse</DialogDescription>
    </DialogContent>
  </Dialog>
);

describe('Dialog', () => {
  it('should render correctly', () => {
    cy.mount(dialog({ open: true }));

    cy.get('[role="dialog"]').should('exist');
    cy.get('[role="dialog"]')
      .invoke('attr', 'aria-describedby')
      .then((ariaDescribedById) => {
        cy.get('p:first')
          .invoke('attr', 'id')
          .then((paragraphId) => {
            // Compare the dialog id with the paragraph id
            expect(ariaDescribedById).to.equal(paragraphId);
          });
      });
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
          <DialogDescription>
            Dialog beskrivelse
            <Button onClick={handleClickSpy}>Knapp</Button>
          </DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    cy.get('[type="button"]').click();
    cy.get('@handleClickSpy').should('have.been.called');
  });
});

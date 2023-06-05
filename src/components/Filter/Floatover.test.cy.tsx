import * as React from 'react';
import { mount } from 'cypress/react18';
// eslint-disable-next-line import/no-unresolved
import 'cypress-real-events';

import { Floatover, type FloatoverProps } from './Floatover';

before(() => {
  // turn off animations
  cy.get('body').invoke(
    'append',
    Cypress.$(`
      <style id="__cypress-animation-disabler">
        *, *:before, *:after {
          transition-property: none !important;
          animation: none !important;
        }
      </style>
    `),
  );
});

const renderFloatover = (props: Partial<FloatoverProps> = {}) => {
  const allProps: FloatoverProps = {
    trigger: <button>Open</button>,
    children: (
      <div>
        <h3>Floatover content</h3>
        <button>Some button</button>
      </div>
    ),
    ...props,
  };
  mount(<Floatover {...allProps} />);
};

describe('Floatover', () => {
  it('renders a filter button', () => {
    renderFloatover();
    cy.get('button').contains('Open');
  });

  describe(
    'Popover',
    {
      viewportHeight: 750,
      viewportWidth: 800,
    },
    () => {
      describe('Autonomous mode', () => {
        it('opens a popup when the filter button is clicked', () => {
          renderFloatover();
          cy.get('button').contains('Open').click();
          cy.get('[role="dialog"]').should('exist');
        });

        it('closes the popup when the filter button is clicked a second time', () => {
          renderFloatover();
          cy.get('button').contains('Open').click();
          cy.get('button').contains('Open').click();
          cy.get('[role="dialog"]').should('not.exist');
        });

        it('closes the popup when user clicks outside of the popup', () => {
          renderFloatover();
          cy.get('button').contains('Open').click();
          // Click at coordinates (0, 200) which is outside of the popup
          cy.get('body').click(200, 0);
          cy.get('[role="dialog"]').should('not.exist');
        });

        it('closes the popup when user presses the Esc key', () => {
          renderFloatover();
          cy.get('button').contains('Open').click();
          // Press the Esc key
          cy.get('body').type('{esc}');
          cy.get('[role="dialog"]').should('not.exist');
        });
      });

      describe('Controlled mode', () => {
        it('should be open when set isOpen is true', () => {
          renderFloatover({
            isOpen: true,
          });
          cy.get('[role="dialog"]').should('exist');
        });

        it('should not be open when set isOpen is false', () => {
          renderFloatover({
            isOpen: false,
          });
          cy.get('[role="dialog"]').should('not.exist');
        });
      });
    },
  );

  describe('Modal', { viewportHeight: 750, viewportWidth: 300 }, () => {
    it('opens a modal spanning the entire screen when the filter button is clicked', () => {
      renderFloatover({ isModal: true });
      cy.get('button').contains('Open').click();
      cy.get('[role="dialog"]').should('exist');
      cy.get('[role="dialog"]').invoke('outerWidth').should('be.gt', 299);
    });

    it('does not close the modal when user clicks inside of the modal', () => {
      renderFloatover({ isModal: true });
      cy.get('button').contains('Open').click();
      // Click at coordinates (200, 200) which is inside of the popup
      cy.get('body').click(200, 200);
      cy.get('[role="dialog"]').should('be.visible');
    });
  });
});

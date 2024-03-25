import * as React from 'react';
import { mount } from 'cypress/react18';
// eslint-disable-next-line import/no-unresolved
import 'cypress-real-events';

import { OptionDisplay, type OptionDisplayProps } from './OptionDisplay';

const options = [
  { label: 'Apples', value: 'apples' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Candy', value: 'candy' },
  { label: 'Daffodils', value: 'daffodils' },
  { label: 'English breakfast', value: 'english breakfast' },
];

const renderOptionDisplay = (props: Partial<OptionDisplayProps>) => {
  mount(
    <OptionDisplay
      options={options}
      {...props}
    />,
  );
};

describe('OptionDisplay', () => {
  it('renders all options', () => {
    renderOptionDisplay({});
    for (let i = 0; i < options.length; i++) {
      cy.contains(options[i].label);
    }
  });

  it('should follow externally set values if set', () => {
    const checked = [options[0].value, options[2].value];
    renderOptionDisplay({ values: checked });
    for (let i = 0; i < options.length; i++) {
      if (checked.includes(options[i].value)) {
        cy.contains('button', `${options[i].label}`).find('[type=checkbox]').should('be.checked');
      } else {
        cy.contains('button', `${options[i].label}`)
          .find('[type=checkbox]')
          .should('not.be.checked');
      }
    }
  });

  it('displays search field when search is enabled', () => {
    renderOptionDisplay({ searchable: true });
    cy.get('input').should('be.visible');
  });

  it('does not display search field when search is disabled', () => {
    renderOptionDisplay({ searchable: false });
    cy.get('input').should('not.be.visible');
  });

  it('only displays options that match the search string when one is entered', () => {
    renderOptionDisplay({ searchable: true });
    cy.get('input:visible').type('breakfast');
    cy.contains('button', 'Breakfast').should('exist');
    cy.contains('button', 'English breakfast').should('exist');
    cy.contains('button', 'Apples').should('not.exist');
  });
});

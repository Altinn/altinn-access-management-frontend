import * as React from 'react';
import { mount } from 'cypress/react';
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
        cy.get(`[aria-label="${options[i].label}"]`).should('be.checked');
      } else {
        cy.get(`[aria-label="${options[i].label}"]`).should('not.be.checked');
      }
    }
  });

  it('displays search field when search is enabled', () => {
    renderOptionDisplay({ searchable: true });
    cy.get('[type=search]').should('be.visible');
  });

  it('does not display search field when search is disabled', () => {
    renderOptionDisplay({ searchable: false });
    cy.get('[type=search]').should('not.exist');
  });

  it('only displays options that match the search string when one is entered', () => {
    renderOptionDisplay({ searchable: true });
    cy.get('[type=search]').type('breakfast');
    cy.get(`[aria-label="Breakfast"]`).should('exist');
    cy.get(`[aria-label="English breakfast"]`).should('exist');
    cy.get(`[aria-label="Apples"]`).should('not.exist');
  });
});

/* eslint-disable cypress/no-unnecessary-waiting */
import * as React from 'react';
import { mount } from 'cypress/react';
// eslint-disable-next-line import/no-unresolved
import 'cypress-real-events';

import { Filter, type FilterProps } from './Filter';

const filterOptions = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
];

const defaultProps: FilterProps = {
  label: 'Filter',
  options: filterOptions,
  applyButtonLabel: 'Apply',
  resetButtonLabel: 'Reset',
};

describe(
  'Filter',
  {
    viewportHeight: 750,
    viewportWidth: 800,
  },
  () => {
    it('renders a filter button', () => {
      mount(<Filter {...defaultProps} />);
      cy.get('button').contains('Filter');
    });

    it('opens a popup when the filter button is clicked', () => {
      mount(<Filter {...defaultProps} />);
      cy.get('button').contains('Filter').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('opens a popup labelled by the button', () => {
      mount(<Filter {...defaultProps} />);
      cy.get('button').contains('Filter').click();
      cy.contains('button', 'Filter')
        .invoke('attr', 'id')
        .then((buttonId) => {
          cy.get('[role="dialog"]')
            .invoke('attr', 'aria-labelledby')
            .then((dialogId) => {
              expect(buttonId).to.eq(dialogId);
            });
        });
    });

    it('closes the popup when the filter button is clicked a second time', () => {
      mount(<Filter {...defaultProps} />);
      cy.get('button').contains('Filter').click();
      cy.get('button').contains('Filter').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('closes the popup when user clicks outside of the popup', () => {
      mount(<Filter {...defaultProps} />);
      cy.get('button').contains('Filter').click();
      // Click at coordinates (0, 200) which is outside of the popup
      cy.get('body').click(200, 0);
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('closes the popup when user presses the Esc key', () => {
      mount(<Filter {...defaultProps} />);
      cy.get('button').contains('Filter').click();
      // Press the Esc key
      cy.get('body').type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('closes the popup when user presses the Apply button', () => {
      mount(<Filter {...defaultProps} />);
      cy.contains('button', 'Filter').click();
      cy.contains(filterOptions[0].label).click();
      // Press the Apply button
      cy.contains('button', 'Apply').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('displays apply button as disabled and unclickable until user has made a change', () => {
      const onApply = () => cy.stub();
      const onApplySpy = cy.spy(onApply).as('onApplySpy');
      mount(
        <Filter
          onApply={onApplySpy}
          {...defaultProps}
        />,
      );
      cy.get('button').contains('Filter').click();
      // Button is aria-disabled and unclickable
      cy.contains('button', 'Apply').should('have.attr', 'aria-disabled', 'true');
      cy.contains('button', 'Apply').click();
      cy.get('@onApplySpy').should('not.have.been.called');

      // Select an option
      cy.get(`[aria-label="${filterOptions[0].label}"]`).click();

      // Button is no longer aria-disabled and is clickable
      cy.contains('button', 'Apply').should('not.have.attr', 'aria-disabled', 'true');
      cy.contains('button', 'Apply').click();
      cy.get('@onApplySpy').should('have.been.called');
    });

    it('displays reset button as aria-disabled when there are no options checked', () => {
      mount(<Filter {...defaultProps} />);
      cy.contains('button', 'Filter').click();
      // Button is aria-disabled
      cy.contains('button', 'Reset').should('have.attr', 'aria-disabled', 'true');
    });

    it('displays reset button as aria-disabled when all active options have been unchecked manually', () => {
      mount(
        <Filter
          values={[filterOptions[0].value]}
          {...defaultProps}
        />,
      );
      cy.get('button').contains('Filter').click();
      cy.contains(filterOptions[0].label).click();
      // Button is aria-disabled
      cy.contains('button', 'Reset').should('have.attr', 'aria-disabled', 'true');
    });

    it('applies the chosen options by calling onApply with the chosen values', () => {
      const onApply = () => cy.stub();
      const onApplySpy = cy.spy(onApply).as('onApplySpy');
      mount(
        <Filter
          onApply={onApplySpy}
          {...defaultProps}
        />,
      );
      cy.get('button').contains('Filter').click();
      cy.contains(filterOptions[0].label).click();
      cy.contains(filterOptions[2].label).click();
      cy.contains('button', 'Apply').click();
      cy.get('@onApplySpy').should('have.been.called');
      cy.get('@onApplySpy').should('have.been.calledWith', [
        filterOptions[0].value,
        filterOptions[2].value,
      ]);
    });

    it('can be opened, navigated, applied with changes by using keyboard', () => {
      const onApply = () => cy.stub();
      const onApplySpy = cy.spy(onApply).as('onApplySpy');
      mount(
        <Filter
          onApply={onApplySpy}
          searchable={false}
          {...defaultProps}
        />,
      );
      // Focus on the filter button and open it
      cy.get('button').contains('Filter').focus();
      cy.focused().should('contain', 'Filter');
      cy.focused().realPress('Enter');
      cy.get('[role="dialog"]').should('be.visible');

      // Use Tab to navigate through the filter options
      for (let i = 0; i < filterOptions.length; i++) {
        if (i === 1) {
          cy.focused().realPress('Space');
        }
        cy.focused().realPress('Tab');
      }

      // Navigate past reset to apply-button and hit enter
      cy.focused().realPress('Tab');
      while (!cy.focused().contains('Apply')) {
        cy.focused().realPress('Tab');
      }

      cy.focused().should('contain', 'Apply');
      cy.focused().realPress('Enter');
      // cy.get('button').contains('Apply').click();

      cy.get('@onApplySpy').should('have.been.called');
      cy.get('@onApplySpy').should('have.been.calledWith', [filterOptions[1].value]);
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('resets the chosen values when user clicks reset', () => {
      const onApply = () => cy.stub();
      const onApplySpy = cy.spy(onApply).as('onApplySpy');
      mount(
        <Filter
          onApply={onApplySpy}
          values={[filterOptions[0].value, filterOptions[1].value, filterOptions[2].value]}
          {...defaultProps}
        />,
      );
      cy.get('button').contains('Filter').click();

      cy.get('button').contains('Reset').click();
      cy.get(`[aria-label="${filterOptions[0].label}"]`).should('not.be.checked');
      cy.get(`[aria-label="${filterOptions[1].label}"]`).should('not.be.checked');
      cy.get(`[aria-label="${filterOptions[2].label}"]`).should('not.be.checked');

      cy.get('button').contains('Apply').click();

      cy.get('@onApplySpy').should('have.been.called');
      cy.get('@onApplySpy').should('have.been.calledWith', []);
    });

    it('preserves the chosen options after closing and opening', () => {
      mount(<Filter {...defaultProps} />);
      // Choose some values and apply them
      cy.get('button').contains('Filter').click();
      cy.contains(filterOptions[0].label).click();
      cy.contains(filterOptions[2].label).click();
      cy.get('button').contains('Apply').click();
      cy.wait(500);

      // Check that they are still applied when reopening
      cy.get('button').contains('Filter').click();
      cy.get(`[aria-label="${filterOptions[0].label}"]`).should('be.checked');
      cy.get(`[aria-label="${filterOptions[2].label}"]`).should('be.checked');
    });

    it('calls onApply if closed without clicking apply', () => {
      const onApply = () => cy.stub();
      const onApplySpy = cy.spy(onApply).as('onApplySpy');
      mount(
        <Filter
          onApply={onApplySpy}
          {...defaultProps}
        />,
      );
      // Choose some values
      cy.get('button').contains('Filter').click();
      cy.contains(filterOptions[0].label).click();
      cy.contains(filterOptions[2].label).click();

      // Close without applying
      cy.get('button').contains('Filter').click();
      cy.get('@onApplySpy').should('have.been.called');
    });

    it('displays search field when search is enabled', () => {
      mount(
        <Filter
          searchable={true}
          {...defaultProps}
        />,
      );
      cy.get('button').contains('Filter').click();
      cy.get('[type=search]').should('be.visible');
    });

    it('does not display search field when search is disabled', () => {
      mount(
        <Filter
          searchable={false}
          {...defaultProps}
        />,
      );
      cy.get('button').contains('Filter').click();
      cy.get('[type=search]').should('not.exist');
    });

    it('adjusts options when they are changed externally', () => {
      const changableOption = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
      ];
      mount(
        <Filter
          {...defaultProps}
          options={changableOption}
        />,
      );

      changableOption.push({ label: 'Option 4', value: '4' });
      cy.get('button').contains('Filter').click();
      cy.contains('Option 4');
    });

    it('accepts active choices provided externally', () => {
      const activeValues = [filterOptions[0].value];
      mount(
        <Filter
          {...defaultProps}
          values={activeValues}
        />,
      );
      cy.get('button').contains('Filter').click();
      cy.get(`[aria-label="${filterOptions[0].label}"]`).should('be.checked');
      cy.get(`[aria-label="${filterOptions[1].label}"]`).should('not.be.checked');

      // There are no 'changes' so the Apply button should be disabled
      cy.get('button').contains('Apply').should('have.attr', 'aria-disabled', 'true');
    });
  },
);

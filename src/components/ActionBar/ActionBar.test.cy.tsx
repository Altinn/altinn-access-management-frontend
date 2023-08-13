import { Provider } from 'react-redux';
import { mount } from 'cypress/react18';
import { Button } from '@digdir/design-system-react';
import * as React from 'react';

import store from '@/rtk/app/store';
import { ActionBar, type ActionBarProps } from '@/components';

Cypress.Commands.add('mount', (component, options = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { reduxStore = store, ...mountOptions } = options as any;

  const wrapped = <Provider store={reduxStore}>{component}</Provider>;

  return mount(wrapped, mountOptions);
});

const expandableActionBar = (props: Partial<ActionBarProps> = {}) => (
  <ActionBar
    additionalText={<div>AdditionalText</div>}
    subtitle={<div>Subtitle</div>}
    title={<div>Title</div>}
    {...props}
  >
    Content
  </ActionBar>
);

const nonExpandableActionBar = (props: Partial<ActionBarProps> = {}) => (
  <ActionBar
    additionalText={<div>AdditionalText</div>}
    subtitle={<div>Subtitle</div>}
    title={<div>Title</div>}
    {...props}
  />
);

const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
const colors: Array<'light' | 'dark' | 'neutral' | 'warning' | 'success' | 'danger'> = [
  'light',
  'dark',
  'neutral',
  'warning',
  'success',
  'danger',
];

describe('ActionBar', () => {
  describe('Varants', () => {
    it('should have heading of given size when explicitly set', () => {
      cy.mount(expandableActionBar({ headingLevel: 1, color: 'neutral', onClick: cy.stub() }));
      cy.get('h1').should('exist');
      cy.get('h2').should('not.exist');
    });
    it('should render an actionbar with a classname corresponding to the given size prop', () => {
      sizes.forEach((size) => {
        mount(expandableActionBar({ size, onClick: cy.stub() }));
        cy.get('button').parent().invoke('attr', 'class').should('include', size);
        sizes
          .filter((s) => s !== size)
          .forEach((otherSize) => {
            cy.get('button').parent().invoke('attr', 'class').should('not.include', otherSize);
          });
      });
    });
    it('should render an actionbar with a classname corresponding to the given color prop', () => {
      colors.forEach((color) => {
        mount(expandableActionBar({ color, onClick: cy.stub() }));
        cy.get('button').parent().invoke('attr', 'class').should('include', color);
        colors
          .filter((c) => c !== color)
          .forEach((otherColor) => {
            cy.get('button').parent().invoke('attr', 'class').should('not.include', otherColor);
          });
      });
    });
  });
  describe('Expandability and actions', () => {
    it('Should render correctly when all props are set and it is expandable', () => {
      const actionButton = <Button>Action</Button>;
      cy.mount(expandableActionBar({ actions: actionButton, open: true, onClick: cy.stub }));
      cy.get('[data-testid="action-bar-icon"]').should('exist');
      cy.get('button').should('contain', 'Title');
      cy.get('button').should('contain', 'Subtitle');
      cy.get('div').should('contain', 'AdditionalText');
      cy.get('button').should('contain', 'Action');
      cy.get('div').should('contain', 'Content');
    });

    it('should render correctly when all props are set and it is not expandable', () => {
      const actionButton = <Button>Action</Button>;
      cy.mount(nonExpandableActionBar({ actions: actionButton }));
      cy.get('[data-testid="action-bar-icon"]').should('not.exist');
      cy.contains('Title');
      cy.contains('Subtitle');
      cy.contains('AdditionalText');
      cy.get('button').should('contain', 'Action');
      cy.get('div').should('not.contain', 'Content');
    });

    it('non expandable version should not render chevron when it is rendered ', () => {
      cy.mount(nonExpandableActionBar());
      cy.get('[data-testid="action-bar-icon"]').should('not.exist');
    });

    it('should not render chevron when non expandable versjon is rendered ', () => {
      cy.mount(nonExpandableActionBar());
      cy.get('[data-testid="action-bar-icon"]').should('not.exist');
    });

    it('should display content when expandable ActionBar is clicked by mouse (uncontroled open)', () => {
      cy.mount(expandableActionBar());

      cy.get('[data-testid="action-bar"]').click();
      cy.contains('Content').should('exist');
    });

    it('should call handleClick when one is provided and expandable ActionBar is clicked by mouse (controled open)', () => {
      const handleClick = () => {
        cy.stub();
      };

      const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

      cy.mount(expandableActionBar({ onClick: handleClickSpy }));

      cy.get('[data-testid="action-bar"]').click();
      cy.get('@handleClickSpy').should('have.been.called');
    });

    it('should call handleClick when expandable ActionBar is clicked by space', () => {
      const handleClick = () => {
        cy.stub();
      };
      const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

      cy.mount(expandableActionBar({ onClick: handleClickSpy }));

      cy.get('[data-testid="action-bar"]').type(' ');
      cy.get('@handleClickSpy').should('have.been.called');
    });

    it('should call handleClick when expandable ActionBar is clicked by enter', () => {
      const handleClick = () => {
        cy.stub();
      };
      const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

      cy.mount(expandableActionBar({ onClick: handleClickSpy }));

      cy.get('[data-testid="action-bar"]').type('{enter}');
      cy.get('@handleClickSpy').should('have.been.called');
    });

    it('should only call handleActionClick when an action in ActionBar is clicked', () => {
      const handleClick = () => {
        cy.stub();
      };

      const handleClickSpy = cy.spy(handleClick).as('handleClickSpy');

      const handleActionClick = () => {
        cy.stub();
      };

      const handleActionClickSpy = cy.spy(handleActionClick).as('handleActionClickSpy');

      const actionButton = (
        <Button
          onClick={handleActionClickSpy}
          aria-label='add'
        >
          Placeholder
        </Button>
      );
      cy.mount(nonExpandableActionBar({ actions: actionButton, onClick: handleClickSpy }));
      cy.get('button[aria-label*="add"]').click();
      cy.get('@handleActionClickSpy').should('have.been.called');
      cy.get('@handleClickSpy').should('not.have.been.called');
    });

    it('should have aria-expanded=false and not show content when expandable and open=false', () => {
      cy.mount(expandableActionBar({ open: false, onClick: cy.stub }));
      cy.get('div').should('not.contain', 'Content');
      cy.get('[data-testid="action-bar"]').should('have.attr', 'aria-expanded', 'false');
    });

    it('should have aria-expanded=true and not show content when expandable and open=true', () => {
      cy.mount(expandableActionBar({ open: true, onClick: cy.stub }));
      cy.get('div').should('contain', 'Content');
      cy.get('[data-testid="action-bar"]').should('have.attr', 'aria-expanded', 'true');
    });
  });
});

import { ExamplePage } from '../../src/components/ExamplePage';

describe('ExamplePage.cy.ts', () => {
  it('playground', () => {
    cy.mount(<ExamplePage />);
  });
});

import { RouterPath } from '@/routes/Router';

describe(RouterPath.GivenApiDelegations + '/' + RouterPath.Overview, () => {
  it('renders correctly', () => {
    cy.visit(RouterPath.GivenApiDelegations + '/' + RouterPath.Overview);
  });
});

export {};

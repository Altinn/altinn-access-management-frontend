import { RouterPath } from '@/routes/Router';

describe(RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsOverview, () => {
  it('renders correctly', () => {
    cy.visit(RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiDelegationsOverview);
  });
});

export {};

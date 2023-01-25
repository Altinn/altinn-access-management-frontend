import { RouterPath } from '@/routes/Router';

describe(RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiOverview, () => {
  it('renders correctly', () => {
    cy.visit(RouterPath.GivenApiDelegations + '/' + RouterPath.GivenApiOverview);
  });
});

export {};

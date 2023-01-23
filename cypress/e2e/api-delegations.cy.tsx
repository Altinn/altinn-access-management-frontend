import { RouterPath } from '@/routes/Router';

describe(RouterPath.GivenApiDelegations + '/' + RouterPath.ReceivedApiDelegations, () => {
  it('renders correctly', () => {
    cy.visit(RouterPath.GivenApiDelegations + '/' + RouterPath.ReceivedApiDelegations);
  });
});

export {};

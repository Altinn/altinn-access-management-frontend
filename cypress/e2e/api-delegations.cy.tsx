import { Paths } from '@/routes/Router';

describe('renders given-api-delegations', () => {
  it('renders correctly', () => {
    cy.visit(Paths.GivenApiDelegationsOverview);
  });
});

export {};

import { RouterPath } from '@/routes/Router';

describe(RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiOverview, () => {
  it('renders correctly', () => {
    cy.visit(RouterPath.OfferedApiDelegations + '/' + RouterPath.OfferedApiOverview);
  });
});

export {};

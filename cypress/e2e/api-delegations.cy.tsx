import { RouterPath } from '@/routes/Router';

describe(RouterPath.OfferedApiDelegations + '/' + RouterPath.Overview, () => {
  it('renders correctly', () => {
    cy.visit(RouterPath.OfferedApiDelegations + '/' + RouterPath.Overview);
  });
});

export {};

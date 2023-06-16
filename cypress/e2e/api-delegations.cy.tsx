import { ApiDelegationPath } from '@/routes/paths';

describe(ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview, () => {
  it('renders correctly', () => {
    cy.visit(ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview);
  });
});

export {};

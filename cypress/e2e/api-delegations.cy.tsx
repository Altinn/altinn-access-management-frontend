import { ApiDelegationPath } from '@/routes/paths/ApiDelegationPath';

describe(ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview, () => {
  it('renders correctly', () => {
    cy.visit(ApiDelegationPath.OfferedApiDelegations + '/' + ApiDelegationPath.Overview);
  });
});

export {};

describe('renders api-delegations', () => {
  it('renders correctly', () => {
    cy.visit('/api-delegations');
    cy.get('button[id=":r2:"]').click();
  });
});

export {};

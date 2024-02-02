/// <reference types='cypress' />
import { idPortenLogin } from '../../support/idPortenLogin';

describe('login tests', () => {
  it('testID login', () => {
    cy.loginWithTestID('20828897528');
  });

  // it('MinID login', () => {
  //    cy.loginWithMinIDNew('02895099735')
  //})
});

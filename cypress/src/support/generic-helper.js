/* eslint-disable cypress/unsafe-to-chain-command */
import { recurse } from 'cypress-recurse';

Cypress.Commands.add('typeAndRetry', (textField, text) => {
  recurse(
    () => cy.get(textField).clear().type(text),
    ($ssnField) => $ssnField.val() == text,
  ).should('have.value', text);
});

cy.helper = {
  convert: (reportee) => {
    if (reportee.length == 11) {
      return reportee.substr(0, 6) + ' ' + reportee.substr(6, 11);
    } else {
      return reportee.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
  },
};

Cypress.Commands.add('selectTestData', () => {
  if (Cypress.config().baseUrl == 'https://altinn.no') {
    cy.fixture('prodTest.json').then((data) => {
      var testdata = data;
      return testdata;
    });
  } else {
    cy.fixture('login.json').then((data) => {
      var testdata = data;
      return testdata;
    });
  }
});

Cypress.Commands.add('setBigIPTestVersion', () => {
  if (Cypress.env().environment && Cypress.env().environment.toLowerCase().includes('test')) {
    cy.visit('/ui/messagebox/?bigiptestversion=true');
    cy.contains('altinn', { matchCase: false });
    Cypress.config('BigIP', 'true');
  } else {
    //cy.log("hiiii" + baseUrl)
    cy.visit('/?bigiptestversion=false');
    cy.contains('altinn', { matchCase: false });
    Cypress.config('BigIP', 'false');
  }
});

Cypress.Commands.add('validateBigIP', () => {
  if (Cypress.env().environment && Cypress.env().environment.toLowerCase().includes('test')) {
    cy.visit('/Pages/logout/lop.aspx');
    cy.get('body').invoke('text').should('be.oneOf', Cypress.config().testløpserver);
  } else {
    cy.visit('/Pages/logout/lop.aspx');
    cy.get('body').invoke('text').should('be.oneOf', Cypress.config().prodløpserver);
  }
});

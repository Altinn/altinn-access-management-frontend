/// <reference types='cypress' />
import { partySelect } from '../../pageObjects/profile3/partyselect';
import { header } from '../../pageObjects/profile3/header';
import { otherWithRights } from '../../pageObjects/profile3/other-with-rights';

/**
 * Command to select preferred language
 * 'english' or 'bokmål' is the expected value to be passed
 */
Cypress.Commands.add('selectLanguage', (languageOption) => {
  cy.intercept('/ui/Profile/ChangeLanguage').as('changeLanguage');
  cy.get('[href="/ui/Profile"]').then(($profile) => {
    if (languageOption == 'english' && !$profile.text().includes('profile')) {
      cy.get(header.languageChangeButton).click();
      cy.get(header.languageOptionsList)
        .find(header.languageSelect.english)
        .should('be.visible')
        .click();
      cy.wait('@changeLanguage');
    } else if (languageOption == 'bokmål' && $profile.text().includes('profile')) {
      cy.get(header.languageChangeButton).click();
      cy.get(header.languageOptionsList)
        .find(header.languageSelect.bokmål)
        .should('be.visible')
        .click();
      cy.wait('@changeLanguage');
    }
  });
});

/**
 * Select the first reportee in list
 */
Cypress.Commands.add('selectOrgAsReportee', () => {
  cy.get(partySelect.reporteeOthers)
    .children('div')
    .should('have.length', 1)
    .find(partySelect.reporteeButton)
    .should('be.visible')
    .click();
  /**
   * Code to click on ask me later when asked to confirm contact information after selecting reportee
   */
  /*cy.get(partySelect.updateContact.form).then(($form) => {
    if ($form.length) {
      cy.get(partySelect.updateContact.form)
        .find(partySelect.updateContact.toInbox)
        .click()
    }
  })*/
});

Cypress.Commands.add('selectSelfAsReportee', (reportee) => {
  cy.visit('/ui/Reportee');
  cy.get(partySelect.search).type(reportee);
  cy.get(partySelect.reporteeSelf).find(partySelect.reporteeButton).should('be.visible').click();
});

Cypress.Commands.add('selectReportee', (reportee) => {
  cy.visit('/ui/Reportee');
  cy.get(partySelect.search).type(reportee);
  cy.get(partySelect.reporteeOthers)
    .find(partySelect.reporteeButton)
    .should('be.visible')
    .should('have.length', 1)
    .first()
    .click();
});

Cypress.Commands.add('selectSmallReporteeSelection', (reportee) => {
  cy.get(partySelect.smallReporteeSelection).click();
  cy.get(partySelect.selectReporteeInSmallSelection.searchInSmallReportee).type(reportee);
  cy.get(partySelect.otherReporteeList)
    .find(partySelect.reporteeButton)
    .should('be.visible')
    .should('have.length', 1)
    .first()
    .click();
});

Cypress.Commands.add('selectBigReporteeSelection', () => {
  cy.get(partySelect.smallReporteeSelection).click();
  cy.get(partySelect.reporteeListContainerForm)
    .find(partySelect.selectReporteeInSmallSelection.showAllParties)
    .click();
});

Cypress.Commands.add('selectOthersWithRights', () => {
  cy.get(otherWithRights.header).should('be.visible').click();
  cy.get(otherWithRights.addNewRights).find(otherWithRights.button).click();
});
/**
 * Select self in reporteeselection via API
 */
Cypress.Commands.add('selectSelfViaAPI', () => {
  const changeReporteeLink = new RegExp("R=(.*)'");
  cy.request('ui/Reportee/SelectMessageBox')
    .its('body')
    .then((body) => {
      const partyId = body.match(changeReporteeLink)[1];
      cy.request('ui/Reportee/ChangeReporteeAndRedirect/?R=' + partyId);
    });
});

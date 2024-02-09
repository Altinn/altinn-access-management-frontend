/// <reference types='cypress' />

import { otherWithRights } from '../../pageObjects/profile3/other-with-rights';
import { localRole } from '../../pageObjects/profile3/localRole';

/**
 * Checks if user has roles or rights for given actor, and deletes all roles and rights if present.
 */
Cypress.Commands.add('ensurePersonHasNoRoleOrRights', (name) => {
  cy.request('/ui/Profile/RightHolders/')
    .its('body')
    .then((body) => {
      if (body.includes(name.toUpperCase())) {
        cy.get(otherWithRights.header).should('be.visible').click();
        cy.get(otherWithRights.rightHolder).contains(name.toUpperCase()).parent().click();
        cy.get(otherWithRights.editRolesAndRightForm.form)
          .find(otherWithRights.editRolesAndRightForm.removeRights)
          .should('be.visible')
          .click();

        //Clicks all occurences of Fjern alle, and confirms deletion
        cy.get('.a-list-heading-action.a-selectable').parent().click({ multiple: true });
        cy.get(otherWithRights.editRolesAndRightForm.form)
          .find(otherWithRights.done)
          .should('be.visible')
          .click();
        cy.get(otherWithRights.receipt).siblings(otherWithRights.done).should('be.visible').click();
        cy.visit('/ui/profile');
        cy.get(otherWithRights.header, {
          timeout: 500,
        }).click();
        cy.visit('ui/profile');
      }
    });
});

Cypress.Commands.add('verifyRoleDelegatedIsAvailableInRolesList', (coveredBy, roleName) => {
  cy.visit('/ui/profile');
  cy.get(otherWithRights.header).click();
  cy.contains(otherWithRights.rightHolder, coveredBy, { matchCase: false }).click();
  cy.get(otherWithRights.editRolesAndRightForm.hasTheseRoles).should('be.visible').click();
  cy.get(otherWithRights.editRolesAndRightForm.rolesUserHas).should('contain.text', roleName);
});

Cypress.Commands.add('addUserNewPersonToDelegateRoles', (coveredBy, coveredByName) => {
  cy.get(otherWithRights.header).click();
  //Add user for delegating role
  cy.get(otherWithRights.addNewRights).click();
  cy.typeAndRetry(otherWithRights.addReportee.SSN.idName, coveredBy);
  cy.typeAndRetry(otherWithRights.addReportee.SSN.surName, coveredByName);
  cy.get(otherWithRights.addReportee.SSN.next).click();
});

// To delegate a role to a user - roleName can be one in the list {Post/arkiv, Tilgangsstyring, Samferdsel, Utfyller/Innsender ,Klientadministrator, Hovedadministrator,Parallell signering}
Cypress.Commands.add('delegateRoleToAUser', (coveredBy, coveredByName, roleName) => {
  cy.get(otherWithRights.header).click();
  //Add user for delegating role
  cy.get(otherWithRights.addNewRights).click();
  cy.typeAndRetry(otherWithRights.addReportee.SSN.idName, coveredBy);
  cy.typeAndRetry(otherWithRights.addReportee.SSN.surName, coveredByName);
  cy.get(otherWithRights.addReportee.SSN.next).click();
  cy.get(otherWithRights.editRolesAndRightForm.hasTheseRoles).should('be.visible').click();
  cy.get(otherWithRights.editRolesAndRightForm.addNewRole).should('be.visible').click();
  cy.get(otherWithRights.editRolesAndRightForm.addFirstRole).contains(roleName).click();
  cy.get(otherWithRights.delegateRightsForm.submitRole).click();
  cy.get(otherWithRights.submitemailform.emailId).type('a@b.no');
  cy.get(otherWithRights.submitemailform.submit).click();
  cy.get(localRole.localRoleForm.ferdigBtn).click();
});

import { apiDelegering } from '../../pageObjects/profile3/APIadministration';

Cypress.Commands.add('deleteAPIsDelegated', () => {
  cy.wait(1000);
  cy.get('body').then((body) => {
    if (
      body.find(
        '*[class^="_overviewActionBarContainer"] > *[class^="_explanatoryContainer"] > *[class^="_apiSubheading"]',
      ).length
    ) {
      cy.contains('Rediger tilganger').click();
      cy.contains('button', 'Lagre').should('be.disabled');
      cy.get('*[class^="_actionBarWrapper"]').each(($ele) => {
        cy.wrap($ele).find('button').contains('Slett').should('be.visible').click();
        cy.contains('button', 'Angre').should('be.visible');

        //verify name of API is crossed out
        cy.get('[data-testid="action-bar"]').should('have.css', 'color', 'rgb(30, 43, 60)');
      });
      cy.contains('button', 'Lagre').should('be.enabled').click();
      cy.get('h3').should('contain.text', 'Din virksomhet har ikke delegert noen API-tilganger');
      cy.visit('/ui/Profile');
    } else {
      cy.visit('/ui/Profile');
    }
  });
});

Cypress.Commands.add('verifyAPIDelegationsOverviewPage', () => {
  cy.contains('Gi og fjerne API tilganger').click();
  cy.get('h1').should('contain', 'Delegerte tilganger til programmerings­grensesnitt - API');
  cy.get('h2').should('contain', 'Programmerings­grensesnitt - API');
});

Cypress.Commands.add('chooseOrgToDelegateAPI', (supplierOrg, supplierOrgName) => {
  cy.wait(1000);
  cy.get('h1').should('contain', 'Gi tilgang til nytt API');
  cy.get('h2').should('contain', 'Ny virksomhet?');
  cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).eq(1).type(supplierOrg);
  cy.get('h4').should('contain', 'Virksomheter basert på ditt søk');
  cy.get(apiDelegering.searchedOrgResultContainer, { timeout: 1000 }).should(
    'contains.text',
    supplierOrgName,
  );
  cy.get(apiDelegering.searchedOrgResultContainer).find('button[aria-label*="Legg til"]').click();
  cy.contains('button', 'Neste').click();
});

Cypress.Commands.add('chooseAPIToBeDelegated', (apiName) => {
  cy.contains('Deleger nytt API').click();
  cy.get('h1').should('contain', 'Gi tilgang til nytt API');
  cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).eq(1).type(apiName);
  //searching for API in seach field to mach the exact string.  Ref: https://stackoverflow.com/a/57894080
  cy.get(apiDelegering.seachedAPIResultContainer)
    .contains(new RegExp('^' + apiName + '$', 'g'))
    .click();
  //clicking Add button for adding API to the list
  cy.get('button[aria-label*="Legg til"]').eq(1).click();
});

Cypress.Commands.add('verifyAPIselectedForDelegation', (apiName) => {
  cy.get(apiDelegering.selectedAPIsForDelegationResultContainer)
    .contains(new RegExp('^' + apiName + '$', 'g'))
    .click();
  cy.contains(apiDelegering.selectedAPIsForDelegationResultContainer, 'Scopes');
  cy.contains(apiDelegering.selectedAPIsForDelegationResultContainer, 'Beskrivelse');
  cy.contains('button', 'Neste').click();
});

Cypress.Commands.add('verifyAPIinAPIDelegationConfirmationPage', (apiName, supplierOrgName) => {
  cy.get('h2').should('contain', 'Du ønsker å gi rettigheter til følgende API');
  cy.contains(apiDelegering.apiListInConfirmationPage, apiName);
  cy.get(apiDelegering.apiListInConfirmationPage).should('contain.text', supplierOrgName);
  cy.contains('button', 'Bekreft').click();
});

Cypress.Commands.add('verifyAPIDelegatedInReceiptPage', (apiName) => {
  cy.get('h2').should('contain.text', 'Disse api-delegeringene ble gitt');
  cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', apiName);
  cy.contains('button', 'Til totaloversikt').click();
});

Cypress.Commands.add(
  'verifyAPIDelegatedInOfferedAPIDelegationsOverviewPage',
  (supplierOrgName, apiName) => {
    cy.get('h1').should('contain', 'Delegerte tilganger til programmerings­grensesnitt - API');
    cy.get('h2').should('contain', 'Programmerings­grensesnitt - API');
    cy.get('h2').should('contain.text', 'Du har tidligere delegert disse tilgangene');
    cy.get(apiDelegering.orgInDelegationsOverviewPage).contains(supplierOrgName).click();
    cy.contains(supplierOrgName)
      .closest('*[class^="_actionBarWrapper_"]')
      .contains(apiName)
      .should('exist');
  },
);

Cypress.Commands.add(
  'verifyAPIDelegatedInReceivedAPIDelegationsOverviewPage',
  (consumerOrgName) => {
    cy.get('h1').should('contain', 'Mottatte tilganger til programmerings­grensesnitt - API');
    cy.get('h2').should('contain', 'Programmerings­grensesnitt - API');
    cy.get('h2').should('contain.text', 'Du har mottatt disse tilgangene');
    cy.get(apiDelegering.orgInDelegationsOverviewPage).contains(consumerOrgName).click();
  },
);

Cypress.Commands.add('deleteReceivedAPIDelegations', () => {
  cy.wait(1000);
  cy.get('body').then((body) => {
    if (body.find('*[class^="_explanatoryContainer"] > *[class^="_apiSubheading"]').length) {
      cy.contains('Rediger tilganger').click();
      cy.get('*[class^="_actionBarWrapper"]').each(($ele) => {
        cy.wrap($ele).find('button').contains('Slett').click();
      });
      cy.contains('button', 'Lagre').should('be.enabled').click();
      cy.get('h3').should(
        'contain.text',
        'Din virksomhet har ikke blitt tildelt noen API-tilganger',
      );
      cy.visit('/ui/Profile');
    } else {
      cy.visit('/ui/Profile');
    }
  });
});

Cypress.Commands.add('chooseSameOrgToDelegateAPI', (supplierOrgName) => {
  cy.get('h1').should('contain', 'Gi tilgang til nytt API');
  cy.get('h4').should('contain', 'Tidligere tildelegerte virksomheter');
  cy.get(apiDelegering.previousDelegatedOrgsContainer).should('contain.text', supplierOrgName);
  cy.contains(supplierOrgName)
    .closest('*[class^="_actionBar_"]')
    .find('button[aria-label*="Legg til"]')
    .click();
  cy.contains('button', 'Neste').click();
});

Cypress.Commands.add('filterAPIUsingAPIProvidersFilterAndAddAPI', (apiName) => {
  cy.contains('Deleger nytt API').click();
  cy.get('button').contains('Filtrer på etat').click();
  cy.wait(1000);
  cy.contains('Testdepartement').click();
  cy.contains('Testdepartement').siblings().should('be.checked');
  cy.get('button').contains(new RegExp('^Bruk$', 'g')).should('be.enabled').click();

  //clicking Add button for adding API
  cy.get(apiDelegering.seachedAPIResultContainer)
    .contains(new RegExp('^' + apiName + '$', 'g'))
    .parentsUntil('*[class^="_actionBar_"]')
    .siblings('*[class^="_actionBarActions_"]')
    .find('button[aria-label*="Legg til"]')
    .click({ timeout: 6000 });

  cy.get(apiDelegering.selectedAPIsForDelegationResultContainer).should('not.be.empty');
  cy.contains('button', 'Neste').click();
});

Cypress.Commands.add('addOrgToListAndMakeItReadyToAddNextOrg', (supplierOrg, supplierOrgName) => {
  cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).eq(1).type(supplierOrg);
  cy.get('h4').should('contain', 'Virksomheter basert på ditt søk');
  cy.get(apiDelegering.searchedOrgResultContainer).should('contains.text', supplierOrgName);
  cy.contains(supplierOrgName)
    .closest('*[class^="_actionBar_"]')
    .find('button[aria-label*="Legg til"]')
    .click();
  cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).eq(1).type('{selectall}{backspace}');
});

Cypress.Commands.add(
  'addMultipleOrgsToDelegateAPI',
  (
    supplierOrg1,
    supplierOrgName1,
    supplierOrg2,
    supplierOrgName2,
    supplierOrg3,
    supplierOrgName3,
  ) => {
    //adding first org to list
    cy.addOrgToListAndMakeItReadyToAddNextOrg(supplierOrg1, supplierOrgName1);
    //adding second org to list
    cy.addOrgToListAndMakeItReadyToAddNextOrg(supplierOrg2, supplierOrgName2);
    //adding third org to list
    cy.addOrgToListAndMakeItReadyToAddNextOrg(supplierOrg3, supplierOrgName3);
    cy.contains('button', 'Neste').click();
  },
);

Cypress.Commands.add('addAPIToListAndMakeItReadyToAddNextAPI', (apiName) => {
  cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).eq(1).type(apiName);
  //searching for API in seach field to mach the exact string.  Ref: https://stackoverflow.com/a/57894080
  cy.get(apiDelegering.seachedAPIResultContainer)
    .contains(new RegExp('^' + apiName + '$', 'g'))
    .click();
  //clicking Add button for adding API to the list
  cy.get(`button[aria-label="Legg til ${apiName}"]`).first().click();
  cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).eq(1).type('{selectall}{backspace}');
});

Cypress.Commands.add('addMultipleAPIsToDelegateAPI', (apiName1, apiName2, apiName3) => {
  cy.contains('Deleger nytt API').click();
  cy.get('h1').should('contain', 'Gi tilgang til nytt API');
  cy.wait(1000);
  //adding first API to the list
  cy.addAPIToListAndMakeItReadyToAddNextAPI(apiName1);
  //adding second API to the list
  cy.addAPIToListAndMakeItReadyToAddNextAPI(apiName2);
  //adding third API to the list
  cy.addAPIToListAndMakeItReadyToAddNextAPI(apiName3);
  cy.contains('button', 'Neste').click();
});

Cypress.Commands.add('deleteAPIFromAPIDelegationConfirmationPage', (apiName) => {
  cy.contains(apiName)
    .closest('*[class^="_baseListItemContent_"]')
    .find('button[aria-label*="Fjern API-delegeringsvalg"]')
    .click();
  cy.get(apiDelegering.apiListInConfirmationPage).should('not.contain', apiName);
});

Cypress.Commands.add('deleteOrgFromAPIDelegationConfirmationPage', (orgName) => {
  cy.contains(orgName)
    .closest('*[class^="_baseListItemContent_"]')
    .find('button[aria-label*="Fjern API-delegeringsvalg"]')
    .click();
  cy.get(apiDelegering.apiListInConfirmationPage).should('not.contain', orgName);
});

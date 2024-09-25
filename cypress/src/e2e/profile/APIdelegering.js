/// <reference types='cypress' />
import { otherWithRights } from '../../../pageObjects/profile3/other-with-rights';
import { apiDelegering } from '../../../pageObjects/profile3/APIadministration';

describe('API delegering tests', () => {
  beforeEach(() => {
    cy.loginWithTestID('14824497789', '310547891');
    cy.log('hiiiiiiiii');
    cy.selectReporteeViaAPI('310547891');
    cy.visit('/ui/profile');
    cy.selectLanguage('bokmål');
  });

  it('Delegate api to an organization by selecting from API providers filter', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();
    //delete api-s delegated
    cy.deleteAPIsDelegated();

    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //choose API by filtering from API providers list and add API to the list
    cy.filterAPIUsingAPIProvidersFilterAndAddAPI('Maskinporten Schema - AM - K6');

    //choose org page - Search for organization and add it to list for delegation
    cy.chooseOrgToDelegateAPI('310661414', 'INTERESSANT KOMPATIBEL TIGER AS');

    //confirmation page for API delegation
    cy.verifyAPIinAPIDelegationConfirmationPage(
      'Maskinporten Schema - AM - K6',
      'INTERESSANT KOMPATIBEL TIGER AS',
    );

    //receipt page for API delegation
    cy.verifyAPIDelegatedInReceiptPage('Maskinporten Schema - AM - K6');

    //verification of delegated api-s in offered-api-delegations overview page
    cy.verifyAPIDelegatedInOfferedAPIDelegationsOverviewPage(
      'INTERESSANT KOMPATIBEL TIGER AS',
      'Maskinporten Schema - AM - K6',
    );

    //delete api-s delegated
    cy.deleteAPIsDelegated();
  });

  it('Verify adding multiple organizations and APIs and deleting them', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();
    //delete api-s delegated
    cy.deleteAPIsDelegated();

    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //add multiple APIs to list for delegation
    cy.addMultipleAPIsToDelegateAPI(
      'Maskinporten Schema - AM - K6',
      'Automation Regression',
      'Automation test',
    );

    //add multiple orgs to list for delegation
    cy.addMultipleOrgsToDelegateAPI(
      '310661414',
      'INTERESSANT KOMPATIBEL TIGER AS',
      '310110914',
      'LYKKELIG DRIFTIG APE',
      '313259412',
      'UROMANTISK ALTERNATIV KATT GÅS',
    );

    //delete API added from API delegerings confirmation page
    cy.deleteAPIFromAPIDelegationConfirmationPage('Maskinporten Schema - AM - K6');
    cy.get(apiDelegering.apiListInConfirmationPage, { timeout: 2000 }).should('have.length', 2);
    cy.deleteAPIFromAPIDelegationConfirmationPage('Automation Regression');

    //verify it is not possible to delete the last API in delegerings confirmation page
    cy.contains('Automation test')
      .closest('*[class^="_baseListItemContent_"]')
      .find('button[aria-label*="Fjern API-delegeringsvalg"]')
      .should('not.exist');
    cy.get(apiDelegering.apiListInConfirmationPage).should('contains.text', 'Automation test');

    //delete org added from API delegerings confirmation page
    cy.deleteOrgFromAPIDelegationConfirmationPage('INTERESSANT KOMPATIBEL TIGER AS');
    cy.deleteOrgFromAPIDelegationConfirmationPage('LYKKELIG DRIFTIG APE');

    //verify it is not possible to delete the last org in delegerings confirmation page
    cy.contains('UROMANTISK ALTERNATIV KATT GÅS')
      .closest('*[class^="_baseListItemContent_"]')
      .find('button[aria-label*="Fjern API-delegeringsvalg"]')
      .should('not.exist');
    cy.get(apiDelegering.orgListInConfirmationPage).should(
      'contains.text',
      'UROMANTISK ALTERNATIV KATT GÅS',
    );
  });

  it('Delegate multiple APIs to multiple orgs and verify them', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();
    //delete api-s delegated
    cy.deleteAPIsDelegated();

    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //add multiple APIs to list for delegation
    cy.addMultipleAPIsToDelegateAPI(
      'Maskinporten Schema - AM - K6',
      'Automation Regression',
      'Automation test',
    );

    //add multiple orgs to list for delegation
    cy.addMultipleOrgsToDelegateAPI(
      '310661414',
      'INTERESSANT KOMPATIBEL TIGER AS',
      '310110914',
      'LYKKELIG DRIFTIG APE',
      '313259412',
      'UROMANTISK ALTERNATIV KATT GÅS',
    );

    cy.contains('button', 'Bekreft').click();

    //verify receipt page for API delegation
    cy.get('h2').should('contain.text', 'Disse api-delegeringene ble gitt');
    cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', 'Maskinporten Schema - AM - K6');
    cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', 'Automation Regression');
    cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', 'Automation test');
    cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', 'INTERESSANT KOMPATIBEL TIGER AS');
    cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', 'LYKKELIG DRIFTIG APE');
    cy.get(apiDelegering.listOfOrgsOrAPIs).should('contain', 'UROMANTISK ALTERNATIV KATT GÅS');
    cy.contains('button', 'Til totaloversikt').click();

    //verification of multiple delegated api-s in offered-api-delegations overview page
    cy.get('h2').should('contain.text', 'Du har tidligere delegert disse tilgangene');
    cy.get(apiDelegering.orgInDelegationsOverviewPage)
      .contains('INTERESSANT KOMPATIBEL TIGER AS')
      .click();
    cy.contains('INTERESSANT KOMPATIBEL TIGER AS')
      .closest('*[class^="_actionBarWrapper_"]')
      .contains('Maskinporten Schema - AM - K6')
      .should('exist');
    cy.contains('INTERESSANT KOMPATIBEL TIGER AS')
      .closest('*[class^="_actionBarWrapper_"]')
      .contains('Automation Regression')
      .should('exist');
    cy.contains('INTERESSANT KOMPATIBEL TIGER AS')
      .closest('*[class^="_actionBarWrapper_"]')
      .contains('Automation test')
      .should('exist');

    //delete api-s delegated
    cy.deleteAPIsDelegated();
  });

  it('Verify Tilgangstyrer do not have access to API delegering panel', () => {
    cy.request('/ui/Profile/RightHolders/')
      .its('body')
      .then((body) => {
        if (body.includes('VAKLENDE JAKKE'.toUpperCase())) {
          cy.get(otherWithRights.header).should('be.visible').click();
          cy.get(otherWithRights.rightHolder)
            .contains('VAKLENDE JAKKE'.toUpperCase())
            .parent()
            .click({ waitForAnimations: false });
          cy.get(otherWithRights.editRolesAndRightForm.rolesUserHas).contains('Tilgangsstyring');
        } else {
          cy.ensurePersonHasNoRoleOrRights('VAKLENDE JAKKE');
          cy.delegateRoleToAUser('44928000998', 'JAKKE', 'Tilgangsstyring');
        }
      });

    //login as Tilgangsstyrer and verify that API delegering panel is not visible for him
    cy.loginWithTestID('44928000998', '310547891');
    cy.selectReporteeViaAPI('310547891');
    cy.visit('/ui/profile');
    cy.selectLanguage('bokmål');

    cy.get(apiDelegering.apiAdministrationPanel).should('not.exist');
  });

  it('Verify user with Programmeringsgrensesnitt (API) role have access to API delegering panel', () => {
    cy.request('/ui/Profile/RightHolders/')
      .its('body')
      .then((body) => {
        if (body.includes('UTHOLDEN BUSSE'.toUpperCase())) {
          cy.get(otherWithRights.header).should('be.visible').click();
          cy.get(otherWithRights.rightHolder)
            .contains('UTHOLDEN BUSSE'.toUpperCase())
            .parent()
            .click({ waitForAnimations: false });
          cy.get(otherWithRights.editRolesAndRightForm.rolesUserHas).contains(
            'Programmeringsgrensesnitt (API)',
          );
        } else {
          cy.ensurePersonHasNoRoleOrRights('UTHOLDEN BUSSE');
          cy.delegateRoleToAUser('03810997418', 'BUSSE', 'Programmeringsgrensesnitt (API)');
        }
      });

    //login as APIADM and verify that API delegering panel is visible for him
    cy.loginWithTestID('03810997418', '310547891');
    cy.selectReporteeViaAPI('310547891');
    cy.visit('/ui/profile');
    cy.selectLanguage('bokmål');

    cy.get(apiDelegering.apiAdministrationPanel).should('be.visible');
  });
  it('Verify when user does not have access to delegate an API', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();
    cy.contains('Deleger nytt API').click();
    cy.get('h1').should('contain', 'Gi tilgang til nytt API');
    cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 }).type(
      'Maskinporten Schema - AM - K6 - NUF',
    );
    cy.get('*[class^="_actionBarActions_"]').first().click();
    cy.get('.fds-alert').should(
      'have.text',
      'FeilDu har ikke tilstrekkelig rettighet til å delegere denne tjenesten. Daglig leder eller hovedadministrator kan hjelpe deg med dette.',
    );
  });
});

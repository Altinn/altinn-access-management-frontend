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

  it('Delegate api to an organization and verify it in his Delegations overview page and delete APIs delegated', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();
    //delete api-s delegated
    cy.deleteAPIsDelegated();

    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //choose api page - select APIs to be delegated
    cy.chooseAPIToBeDelegated('Maskinporten Schema - AM - K6');

    //verifying selected APIs for delegation
    cy.verifyAPIselectedForDelegation('Maskinporten Schema - AM - K6');

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

    //Verification of  button of delegate new API
    cy.contains('Deleger nytt API', { timeout: 6000 }).should('be.visible');

    //Verification of button to edit access
    cy.contains('Rediger tilganger', { timeout: 6000 }).should('be.visible');

    //delete api-s delegated
    cy.deleteAPIsDelegated();
  });

  it('Delegate api to an organization and supplierOrg verifies it in its Delegations overview page and delete APIs it received', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();

    //delete api-s delegated
    cy.deleteAPIsDelegated();
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //choose api page - select APIs to be delegated
    cy.chooseAPIToBeDelegated('Maskinporten Schema - AM - K6');

    //verifying selected APIs for delegation
    cy.verifyAPIselectedForDelegation('Maskinporten Schema - AM - K6');

    //choose org page - Search for organization and add it to list for delegation
    cy.chooseOrgToDelegateAPI('310661414', 'INTERESSANT KOMPATIBEL TIGER AS');

    //confirmation page for API delegation
    cy.verifyAPIinAPIDelegationConfirmationPage(
      'Maskinporten Schema - AM - K6',
      'INTERESSANT KOMPATIBEL TIGER AS',
    );

    //receipt page for API delegation
    cy.verifyAPIDelegatedInReceiptPage('Maskinporten Schema - AM - K6');

    //login as DAGL of supplierOrg who recieved API delegation
    cy.loginWithTestID('26856499412', '310661414');
    cy.selectReporteeViaAPI('310661414');
    cy.visit('/ui/profile');
    cy.selectLanguage('bokmål');

    //verify API delegations recieved as supplierOrg
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Mottatte API tilganger', { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegatedInReceivedAPIDelegationsOverviewPage('AKTVERDIG RETORISK APE');

    //delete received API delegations
    cy.deleteReceivedAPIDelegations();
  });

  it('Delegate api to organization to which api was delegated before', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();

    //delete api-s delegated
    cy.deleteAPIsDelegated();
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //choose api page - select APIs to be delegated
    cy.chooseAPIToBeDelegated('Maskinporten Schema - AM - K6');

    //verifying selected APIs for delegation
    cy.verifyAPIselectedForDelegation('Maskinporten Schema - AM - K6');

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

    //choose api page - select APIs to be delegated
    cy.chooseAPIToBeDelegated('Automation Regression');

    //verifying selected APIs for delegation
    cy.verifyAPIselectedForDelegation('Automation Regression');

    //choose same org which got delegation before
    cy.chooseSameOrgToDelegateAPI('INTERESSANT KOMPATIBEL TIGER AS');

    //confirmation page for API delegation
    cy.verifyAPIinAPIDelegationConfirmationPage(
      'Automation Regression',
      'INTERESSANT KOMPATIBEL TIGER AS',
    );

    //receipt page for API delegation
    cy.verifyAPIDelegatedInReceiptPage('Automation Regression');

    //verification of delegated api-s in offered-api-delegations overview page
    cy.verifyAPIDelegatedInOfferedAPIDelegationsOverviewPage(
      'INTERESSANT KOMPATIBEL TIGER AS',
      'Automation Regression',
    );

    //delete api-s delegated
    cy.deleteAPIsDelegated();
  });

  it('Verify filtering of API providers in API delagation and verify Forrige/ Neste buttons', () => {
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.contains('Gi og fjerne API tilganger', { timeout: 6000 }).should('be.visible').click();

    //delete api-s delegated
    cy.deleteAPIsDelegated();
    cy.get(apiDelegering.apiAdministrationPanel, { timeout: 6000 }).should('be.visible').click();
    cy.verifyAPIDelegationsOverviewPage();

    //verify filter and values in it
    cy.contains('Deleger nytt API').click();
    cy.get('button').contains('Filtrer på etat').click();
    cy.contains('button', 'Nullstill valg').should('have.attr', 'aria-disabled', 'true');
    cy.get('button')
      .contains(new RegExp('^Bruk$', 'g'))
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('[role="dialog"]')
      .should('contain.text', 'Digitaliseringsdirektoratet')
      .and('contain.text', 'Testdepartement');
    cy.wait(1000);

    //click option in filter, reset it and verify if it is reset
    cy.contains('Testdepartement').click();
    cy.contains('button', 'Nullstill valg').should('be.enabled').click();
    cy.contains('Testdepartement').siblings().should('not.be.checked');

    //click option in filter, click same option again and verify if it resets
    cy.contains('Testdepartement').click();
    cy.contains('button', `Testdepartement`).find('[type=checkbox]').should('be.checked');
    cy.contains('Testdepartement').click();
    cy.contains('button', `Testdepartement`).find('[type=checkbox]').should('not.be.checked');

    //select Testdepartement option from filter and verify only APIs with Testdepartement as provider is listed
    cy.contains('Testdepartement').click();
    cy.contains('button', `Testdepartement`).find('[type=checkbox]').should('be.checked');
    cy.get('button').contains(new RegExp('^Bruk$', 'g')).should('be.enabled').click();
    cy.get(
      ':nth-child(1) > *[class^="_delegableApisContainer"] > *[class^="_actionBarWrapper"]',
    ).each(($ele) => {
      cy.wrap($ele).should('contain', 'Testdepartement');
      // .and('not.contain', 'Digitaliseringsdirektoratet');
      //cy.get('button').contains('Filtrer på etat').click();
      //cy.contains('')
    });

    //click on Add for first element in the list and verify if it is listed under Valgte API
    cy.get(apiDelegering.searchForOrgOrAPI, { timeout: 1000 })
      .first()
      .type('Maskinporten Schema - AM - K6');
    cy.get(`button[aria-label="Legg til Maskinporten Schema - AM - K6"]`).first().click();
    cy.get(apiDelegering.selectedAPIsForDelegationResultContainer).should('not.be.empty');
    cy.get('*[class^="_actionBarTexts_"]').each(($ele) => {
      cy.wrap($ele)
        .should('contain', 'Testdepartement')
        .and('not.contain', 'Digitaliseringsdirektoratet');
    });

    //click on Forrige and Neste button and verify them
    cy.contains('button', 'Neste').click();
    cy.url().should('contain', '/offered-api-delegations/choose-org');
    cy.contains('button', 'Forrige').click();
    cy.url().should('contain', '/offered-api-delegations/choose-api');

    //click Remove to remove API from the Valgte API list and verify it is not listed
    cy.get(':nth-child(2) > *[class^="_delegableApisContainer"] > *[class^="_actionBarWrapper"]')
      .children()
      .first()
      .find('button[aria-label*="Fjern"]')
      .click();
    cy.get(
      ':nth-child(2) > *[class^="_delegableApisContainer"] > *[class^="_actionBarWrapper"]',
    ).should('be.empty');

    //click on Avbryt button and verify them
    cy.contains('button', 'Avbryt').click();
    cy.url().should('contain', '/offered-api-delegations/overview');
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
    cy.get('*[class^="fds-alert-icon-"]').should('have.text', 'Feil');
  });
});

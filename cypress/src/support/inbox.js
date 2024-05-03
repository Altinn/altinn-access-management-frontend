/// <reference types='cypress' />
import { inboxPage } from '../../pageObjects/Inbox/inbox';

// Code to search element and perform operation on that element in Inbox
// search = 'GUI rep1' ;
// operation = 'delete' ; 'goToFormCompletion' ; 'permanentDelete' ; 'undoDelete' ; 'archive'
Cypress.Commands.add('searchInboxAndPerform', (search, operation) => {
  cy.get('body').then((inbox) => {
    if (inbox.find(inboxPage.messageBoxElements).length > 0) {
      cy.get(inboxPage.messageBoxElements)
        .find('h3')
        .each(($el, $index) => {
          cy.wrap($el)
            .invoke('text')
            .then((title) => {
              if (title.includes(search)) {
                switch (operation) {
                  case 'check':
                    cy.log('Found element with title: ' + search);
                    break;

                  case 'expand':
                    cy.inboxExpandElement(search);
                    break;

                  case 'delete':
                    cy.inboxDeleteElement(title, search);
                    break;

                  case 'goToFormCompletion':
                    cy.inboxGoToFormCompletion(title, search);
                    break;

                  case 'permanentDelete':
                    cy.inboxPermanentDelete(search);
                    break;

                  case 'undoDelete':
                    cy.inboxUndoDelete(search);
                    break;

                  case 'archive':
                    cy.inboxArchiveAnElement(search);
                    break;

                  default:
                    cy.visit('/ui/MessageBox');
                    break;
                }
              }
            });
        });
    } else {
      cy.log('Inbox is empty!');
    }
  });
});

Cypress.Commands.add('inboxExpandElement', (search) => {
  cy.contains(search).click();
});

Cypress.Commands.add('inboxPermanentDelete', (search) => {
  cy.inboxExpandElement(search);
  cy.get('.card-block')
    .find('button[data-popover-content*="deleteElementPopoverContentPanel"]')
    .click({ timeout: 6000 });
  cy.get('.popover-body').contains('Ok').click({ timeout: 6000 });
  cy.reload();
});

Cypress.Commands.add('inboxUndoDelete', (search) => {
  cy.inboxExpandElement(search);
  cy.get('.card-block')
    .find('button[onclick*="Element/"][onclick*="Restore"]')
    .click({ timeout: 6000 });
  cy.reload();
});

Cypress.Commands.add('inboxArchiveAnElement', (search) => {
  cy.inboxExpandElement(search);
  cy.get('.card-block').find('button[onclick*="Archive/"]').click({ timeout: 6000 });
  cy.reload();
});

//** Opens up a message and clicks the "confirm received" button and archives it */
Cypress.Commands.add('confirmAndArchiveMessage', (search) => {
  cy.contains(search).click();
  cy.get('.card-block button[onclick*="confirmCorrespondence"]').click({
    timeout: 6000,
  });
  cy.get('.card-block i.reg-archive').parent().click();
});

Cypress.Commands.add('inboxDeleteElement', (title, search) => {
  if (title.includes('completion')) {
    cy.inboxExpandElement(search);
    cy.get('.card-block').find('button[id^="deleteDraft"]').click();
    cy.get('.popover-body').contains('Ok').click({ timeout: 6000 });
  } else {
    cy.inboxExpandElement(search);
    cy.get('.card-block').then(($body) => {
      if ($body.find('button.a-btn-link.dropdown-menu-button').length) {
        cy.get('button.a-btn-link.dropdown-menu-button').should('be.visible').click();
        cy.get('a[onclick*="\'/ui/MessageBox/DeleteActiveElement/\'"]')
          .should('be.visible')
          .click();
      } else {
        cy.get('.card-block').find('button[onclick*="Element/"][onclick*="Delete"]').click({
          timeout: 6000,
        });
      }
    });
  }
  cy.reload();
});

Cypress.Commands.add('inboxGoToFormCompletion', (title, search) => {
  if (title.includes('completion')) {
    cy.inboxExpandElement(search);
    cy.get('.card-block')
      .find('button[onclick*="/ui/Reporting/RedirectToActiveElement"]')
      .click({ timeout: 7000 });
    cy.contains(search).should('exist', { timeout: 6000 });
  } else {
    cy.inboxExpandElement(search);
    cy.get('.card-block')
      .find('button[onclick*="/ui/Reporting/RedirectToActiveElement"]')
      .click({ timeout: 6000 });
  }
});

// get Messages through REST API Request eg: urlAddress = '/api/my/messages' OR '/api/my/messages/a90786'
Cypress.Commands.add('getInboxRESTMessage', (urlAddress) => {
  let authcookie;
  let address;
  cy.getCookie('.ASPXAUTH')
    .should('exist')
    .then((c) => {
      authcookie = c.value;
      address = urlAddress;
      cy.log('Big IP Test Version is set to: ' + Cypress.config('BigIP'));
      cy.request({
        method: 'GET',
        url: address,
        headers: {
          Accept: 'application/json',
          Cookie: '.ASPXAUTH=' + authcookie,
          APIKey: Cypress.config().UserAPIKey,
        },
        qs: {
          bigiptestversion: Cypress.config('BigIP'),
          language: '1033', //english Language
        },
        failOnStatusCode: false,
      }).as('getMessages');
    });
});

export function removeAllMessages() {
  cy.visit('/ui/messageBox');
  removeMessages();
  cy.visit('/ui/MessageBox/Archive');
  removeMessages();
  cy.visit('/ui/messageBox/Trash');
  removeMessages();
}

export function removeMessages() {
  cy.intercept('/ui/MessageBox/PermanentDeleteActiveElement/*').as('deleteMessage');
  cy.get('body').then((body) => {
    cy.log('number of messages: ' + body.find('.reg-trash').length);
    for (let i = 0; i < body.find('.reg-trash').length; i++) {
      cy.get('.reg-trash').parent(':visible').first().click();
      cy.get('body').then((body) => {
        if (body.find('.popover-body')) {
          body.find('.popover-body .a-btn-danger').trigger('click');
        }
      });
      cy.wait(500);
    }
  });
}

export function forwardInboxMessageTo(messageTitle, ssn, surname) {
  cy.visit('/ui/MessageBox');
  forwardMessage(messageTitle, ssn, surname);
}

export function forwardArchivedMessageTo(messageTitle, ssn, surname) {
  cy.visit('/ui/MessageBox/Archive');
  forwardMessage(messageTitle, ssn, surname);
}

export function forwardMessage(messageTitle, ssn, surname) {
  cy.intercept('/ui/MessageBox/*').as('messageBox');
  cy.contains(messageTitle).click();

  cy.get('.card-block i.reg-forward-msg').parent().click();
  cy.get('[onClick*="ddNewSingleInstanceRightHolder"]').click();
  cy.typeAndRetry('#NewRightHolder_NewRightHolderPerson_SsnUsername', ssn);
  cy.typeAndRetry('#NewRightHolder_NewRightHolderPerson_Surname', surname);
  cy.get('#submitAddNewPerson').click();
  cy.get('#submit-email-rights').click();
  cy.typeAndRetry('#submit-email-input', 'autoportaltest@digdir.no');
  cy.get('#addRecipientEmail .a-btn-success').click();
  cy.get('[onsubmit*="EncodeMessage"] .a-btn-success').click();
  cy.contains(messageTitle).click();
}

export function fillAndSendForm(messageTitle, ssn, surname) {
  cy.contains(messageTitle).click();
  cy.get('[onClick*="RedirectToActiveElement"]').click();
  cy.typeAndRetry('#ctl00_ctl00_MasterPageContent_PageContent_XmlFormView1_V1_I1_R9_I2_T1', ssn);
  cy.get('#ctl00_ctl00_MasterPageContent_PageContent_XmlFormView1_V1_I1_R9_I2_T3')
    .should('be.visible')
    .click();
  cy.wait(1000);
  cy.typeAndRetry(
    '#ctl00_ctl00_MasterPageContent_PageContent_XmlFormView1_V1_I1_R9_I2_T3',
    surname,
  );
  selectWorkaround(
    '#ctl00_ctl00_MasterPageContent_PageContent_XmlFormView1_V1_I1_S13_I5_D2',
    'Annet',
  );
  cy.get('#ctl00_ctl00_MasterPageContent_PageContent_FormTaskTabMenu1_lnkformOverViewTab').click();
  selectWorkaround('#ctl00_ctl00_MasterPageContent_PageContent_ddlAttachmentType', 'AT01_Cycle01');
  cy.wait(2000);
  cy.get('input[type="file"]').selectFile('src/fixtures/Attachment.pdf');
  cy.wait(2000);
  selectWorkaround('#ctl00_ctl00_MasterPageContent_PageContent_ddlAttachmentType', 'AT02_Cycle01');
  cy.wait(2000);
  cy.get('input[type="file"]').selectFile('src/fixtures/Attachment.pdf');
  cy.wait(5000);
  selectWorkaround('#ctl00_ctl00_MasterPageContent_PageContent_ddlAttachmentType', 'AT04_Cycle01');
  cy.wait(2000);
  cy.get('input[type="file"]').selectFile('src/fixtures/SoapCmd.exe');
  cy.wait(2000);
  selectWorkaround('#ctl00_ctl00_MasterPageContent_PageContent_ddlAttachmentType', 'AT06_Cycle01');
  cy.wait(2000);
  cy.get('input[type="file"]').selectFile('src/fixtures/TS0204_Valid_998_11134.xml');
  cy.wait(2000);
  cy.get('input[type="file"]').selectFile('src/fixtures/TS0204_Valid_998_11134.xml');
  cy.wait(2000);
  cy.get('#ctl00_ctl00_MasterPageContent_PageContent_btnValidateAll').should('be.enabled').click();
  cy.get('#ctl00_ctl00_MasterPageContent_PageContent_btnSend').should('be.enabled').click();
  cy.get('#ctl00_ctl00_MasterPageContent_PageContent_btnPerformCurrentStep')
    .should('be.enabled')
    .click();
}

export function selectWorkaround(element, option) {
  cy.get(element).focus();
  cy.wait(250);
  cy.get('body').trigger('keydown', { keyCode: 27 });
  cy.wait(500);
  cy.get('body').trigger('keyup', { keyCode: 27 });
  cy.get(element).select(option, { force: true });
}

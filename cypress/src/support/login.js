/* eslint-disable no-self-assign */
/// <reference types='cypress' />
import { login } from '../../pageObjects/login';
import * as pins from '../../src/fixtures/pin.json';
import { partySelect } from '../../pageObjects/profile3/partyselect';

/**
 * Find the second pin to type and enter it
 */
Cypress.Commands.add('typePinTwo', (pinSet) => {
  cy.get(login.altinnPin.pinTwoText).then((label) => {
    const labelText = label.text();
    const pinNo = labelText.replace(/Kode |Code number /s, '').split(' ')[0];
    cy.get(login.altinnPin.pinTwo).type(pinSet == 'ajhhs' ? pins[parseInt(pinNo)] : pins[0]);
  });
});

/**
 * Login with altinpin via post requests and create a session. If session already exists, it switches to the existing session instead
 */
Cypress.Commands.add('loginWithSession', (username, pin, reportee) => {
  if (pin && pin.length == 5) {
    pin = pin;
  } else {
    reportee = pin;
    pin = null;
  }
  if (reportee == null) {
    reportee = username;
  }
  cy.session(
    { username, pin, reportee },
    () => {
      cy.setBigIPTestVersion();
      const tokenRegexp = new RegExp('__RequestVerificationToken" type="hidden" value="(.*)" />');
      const pincodeRegexp = new RegExp('Kode (.*) i Altinn');

      const errormsg = new RegExp('data-val-length="(.*)" data-val-length-max');

      // Get verification token
      cy.request('/ui/Authentication/AltinnPin')
        .its('body')
        .then((body) => {
          var pin1 = pin == null ? 'ajhhs' : pin; // if pin=Null, then pin1='ajhhs', else pin1=pin(whatever user passes)
          // enter ssn and pin1 and submit
          cy.request({
            method: 'POST',
            url: '/ui/Authentication/AltinnPin',
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body:
              '__RequestVerificationToken=' +
              body.match(tokenRegexp)[1] +
              '&AltinnPinOneRequest.UserNameOrSsn=' +
              username +
              '&AltinnPinOneRequest.Pin=' +
              pin1 +
              '&X-Requested-With=XMLHttpRequest',
          })
            .its('body')
            .then((body) => {
              if (body.match(pincodeRegexp)[1] == '1') {
                throw new Error(
                  'user ' + username + ' login failed! See Error msg : ' + body.match(errormsg)[1],
                );
              }

              cy.log('user: ' + username + ', pin number count: ' + body.match(pincodeRegexp)[1]);
              var pin2 = pin1 == '12345' ? '12345' : pins[parseInt(body.match(pincodeRegexp)[1])];
              // enter pin2 and submit
              cy.request({
                method: 'POST',
                url: '/ui/Authentication/AltinnPin2',
                headers: {
                  Accept: '*/*',
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body:
                  '__RequestVerificationToken=' +
                  body.match(tokenRegexp)[1] +
                  '&AltinnPinTwoRequest.Pin=' +
                  pin2,
              })
                .its('body')
                .then((body) => {
                  // save session
                  window.localStorage.setItem('authToken', body.token);
                });
            });
        });
    },
    {
      validate() {
        //check BigIP to be set
        cy.validateBigIP();
        // select reportee
        if (reportee == username) {
          cy.selectSelfViaAPI();
        } else {
          cy.selectReporteeViaAPI(reportee);
        }
        // ensure correct reportee was selected
        cy.visit('ui/profile');
        if (reportee.length == 11) {
          cy.get('h1').should('contain.text', reportee.substr(0, 6) + ' ' + reportee.substr(6, 11));
        } else {
          cy.get('h1').should('contain.text', reportee.replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
        }
      },
    },
  );
});

/**
 * Select given reportee in reporteeselection via API
 */

Cypress.Commands.add('selectReporteeViaAPI', (reportee) => {
  const tokenRegexp = new RegExp('__RequestVerificationToken" type="hidden" value="(.*)" />');
  const changeReporteeLink = new RegExp("R=(.*)'");
  cy.request('ui/Reportee')
    .its('body')
    .then((body) => {
      cy.request({
        method: 'POST',
        url: 'ui/Reportee/Search',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body:
          '__RequestVerificationToken=' +
          body.match(tokenRegexp)[1] +
          '&ReporteeSearch.SearchText=' +
          reportee,
      })
        .its('body')
        .then((body) => {
          // find the reportee's partyid using ui/reportee/search, then switch reportee
          const partyId = body.reporteeList.match(changeReporteeLink)[1];
          cy.request('ui/Reportee/ChangeReporteeAndRedirect/?R=' + partyId);
        });
    });
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

/**
 * Login with altinnpin with the pin set
 */
Cypress.Commands.add('loginWithPin', (userName, pinSet) => {
  cy.setBigIPTestVersion();
  cy.visit('/ui/authentication');
  cy.get(login.altinnPin.form).find(login.userName).should('be.visible').type(userName);
  cy.get(login.altinnPin.pinOne).type(pinSet == 'ajhhs' ? pins[1] : pins[0]);
  cy.get(login.altinnPin.submitPinOne).click();
  cy.typePinTwo(pinSet);
  cy.get(login.altinnPin.submitPinTwo).click();
});

/**
 * Login with altinn password
 */
Cypress.Commands.add('loginWithPassword', (userName, password) => {
  cy.setBigIPTestVersion();
  cy.visit('/ui/authentication');
  cy.get(login.altinnPwd.passwordTab).should('be.visible').click();
  cy.get(login.altinnPwd.form).find(login.userName).should('be.visible').type(userName);
  cy.get(login.altinnPwd.password).type(password);
  cy.get(login.altinnPwd.submit).click();
});

// Logout
Cypress.Commands.add('Logout', () => {
  cy.visit('/ui/MessageBox');
  cy.get('button.a-personSwitcher').first().click();
  cy.get('.a-link-logout').click();
});

/**
 * Login with SI User with password
 */
Cypress.Commands.add('loginWithSIUser', (SIuserName, SIpassword) => {
  cy.session(
    { SIuserName },
    () => {
      cy.setBigIPTestVersion();
      cy.visit('ui/Authentication/SelfIdentified');
      cy.get(login.altinnSIUser.form)
        .find(login.altinnSIUser.siUserName)
        .should('be.visible')
        .type(SIuserName);
      cy.get(login.altinnSIUser.form)
        .find(login.altinnSIUser.siPassword)
        .should('be.visible')
        .type(SIpassword);
      cy.get(login.altinnSIUser.submitButton).click();
    },
    {
      validate() {
        cy.validateBigIP();
        cy.visit('ui/profile');
        cy.get('h1').should('contain.text', SIuserName);
      },
    },
  );
});

//Login with EC user
Cypress.Commands.add(
  'loginWithECUser',
  (ECUsername, ECUserPassword, ECUserOrgNumber, ECUserOrgName) => {
    cy.session(
      { ECUsername },
      () => {
        cy.setBigIPTestVersion();
        cy.visit('ui/Authentication/EnterpriseIdentified');
        cy.get(
          'button[onclick*="/ui/Authentication/EnterpriseIdentified?ForceEIAuthentication"]',
        ).click();
        cy.get(login.altinnECUser.ecUsername).type(ECUsername);
        cy.get(login.altinnECUser.ecPassword).type(ECUserPassword);
        cy.get(login.altinnECUser.ecLoginButton).should('be.enabled').click();
        cy.get(partySelect.search).type(ECUserOrgNumber);
        cy.selectOrgAsReportee();
      },
      {
        validate() {
          cy.validateBigIP();
          cy.visit('ui/profile');
          cy.get('h1').should('contain.text', ECUserOrgName);
        },
      },
    );
  },
);

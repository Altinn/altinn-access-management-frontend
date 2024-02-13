Cypress.Commands.add('loginWithTestID', (ssn, reportee) => {
  if (reportee == null) {
    reportee = ssn;
  }
  cy.session(
    { ssn, reportee },
    () => {
      cy.setBigIPTestVersion();
      const actual = Cypress.config().baseUrl;
      cy.visit(actual);
      cy.contains('Logg inn').click();
      cy.contains('TestID').click();

      cy.get('#pid').type(ssn);
      cy.contains('Autentiser').click();
    },
    {
      validate() {
        // select reportee
        if (reportee == ssn) {
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

Cypress.Commands.add('loginWithMinIDNew', (ssn, reportee) => {
  if (reportee == null) {
    reportee = ssn;
  }
  cy.session(
    { ssn, reportee },
    () => {
      cy.setBigIPTestVersion();
      const actual = Cypress.config().baseUrl;
      cy.visit(actual);
      cy.contains('Logg inn').click();
      cy.contains('MinID').click();

      const sentArgs = { minid_ssn: ssn, password: 'password01', sms: '12345' };
      cy.origin(
        'https://login.test.minid.no/',
        // Send the args here...
        { args: sentArgs },
        // ...and receive them at the other end here!
        ({ minid_ssn, password, sms }) => {
          cy.get('#pid', { includeShadowDom: true })
            .find('.w-full.p-4', { includeShadowDom: true })
            .type(minid_ssn, { force: true });

          cy.get('#password', { includeShadowDom: true })
            .find('.w-full.p-4', { includeShadowDom: true })
            .type(password, { force: true });

          cy.get('#submit-button', { includeShadowDom: true }).click();

          cy.get('#otc', { includeShadowDom: true })
            .find('.mb-5', { includeShadowDom: true })
            .type(sms, { force: true });

          cy.get('#submit-button', { includeShadowDom: true }).click();
        },
      );
      //cy.url().should('contain', '/ui/Reportee/SelectMessageBox')
    },
    {
      validate() {
        // select reportee
        if (reportee == ssn) {
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

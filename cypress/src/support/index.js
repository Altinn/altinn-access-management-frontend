import './login';
import './party-select';
import './other-with-rights-helper';
import './inbox';
import './generic-helper';
import './APIadministration';
import './idPortenLogin';

const registerCypressGrep = require('cypress-grep');
registerCypressGrep();

before(() => {
  Cypress.on('uncaught:exception', (e, runnable) => {
    console.log('error', e);
    console.log('runnable', runnable);
    return false;
  });
});

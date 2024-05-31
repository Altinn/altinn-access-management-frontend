/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */

import { test } from './../fixture/pomFixture';

test('User A who is DAGL/HADM for org delegates resources/Altinn 3 app/Altinn 2 services to User B', async ({
  login,
  delegate,
  delegateRights,
  deleteRights,
  logoutUser,
  coverebyRights,
  context,
  page,
}) => {
  await login.gotoLoginPage('03835898554', page);
  await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);

  //To delete rights - setup
  // GIVEN user without delegated rights to ROMANTISK ESKE
  await deleteRights.revokeRightsSSN('ROMANTISK ESKE');

  //To delegate rights
  // WHEN user delegates to ROMANTISK ESKE
  await delegate.delegateToSSN('11868898854', 'ESKE');
  await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
  await delegateRights.delegateRightsToSSN('Automatiseringstest for Access Management');
  await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
  await logoutUser.gotoLogoutPage('OPPKLARENDE OMKOMMEN TIGER AS', page);
  // await context1.close();
  await context.clearCookies();

  //Login with covereby User

  await login.gotoLoginPage('11868898854', page);
  await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);
  await coverebyRights.checkCoverebyRights();
  // await context.close();
});

test('User A who is DAGL/HADM for org delegates resources/Altinn 3 app/Altinn 2 services to Org B', async ({
  login,
  delegate,
  delegateRights,
  deleteRights,
  logoutUser,
  coverebyRights,
  context,
  page,
}) => {
  await login.gotoLoginPage('03835898554', page);
  await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);

  //To delete rights - setup
  // GIVEN user without delegated rights to ROMANTISK ESKE
  await deleteRights.revokeRightsSSN('GJESTFRI RESERVERT HUND DA');

  //To delegate rights
  // WHEN user delegates to
  await delegate.delegateToOrg('310832170', 'GJESTFRI RESERVERT HUND DA');
  await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
  await delegateRights.delegateRightsToSSN('Automatiseringstest for Access Management');
  await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
  await logoutUser.gotoLogoutPage('OPPKLARENDE OMKOMMEN TIGER AS', page);
  // await context1.close();
  await context.clearCookies();

  //Login with covereby User

  await login.gotoLoginPage('21908498426', page);
  await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);
  await coverebyRights.checkCoverebyRights();
});

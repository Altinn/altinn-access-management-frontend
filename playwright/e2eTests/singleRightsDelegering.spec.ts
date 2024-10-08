/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */

import { test } from './../fixture/pomFixture';

test.describe('User with DAGL/HADM role without having resource access themselves', () => {
  test('User A who is DAGL/HADM for org delegates resources/Altinn 3 app/Altinn 2 services to User B', async ({
    login,
    delegate,
    delegateRights,
    deleteRights,
    logoutUser,
    coverebyRights,
    context,
  }) => {
    test.setTimeout(60000 * 3);

    await login.loginWithUser('03835898554');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to ROMANTISK ESKE
    await deleteRights.revokeRightsSSN('ROMANTISK ESKE');

    //To delegate rights
    // WHEN user delegates to ROMANTISK ESKE
    await delegate.delegateToSSN('11868898854', 'ESKE');
    await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
    await delegateRights.delegateRightsToSSN('Automatiseringstest for Access Management');
    await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
    await logoutUser.gotoLogoutPage('OPPKLARENDE OMKOMMEN TIGER AS');
    // await context1.close();
    await context.clearCookies();

    //Login with covereby User

    await login.loginWithUser('11868898854');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');
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
  }) => {
    test.setTimeout(60000 * 3);

    await login.loginWithUser('03835898554');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to OPPKLARENDE OMKOMMEN TIGER AS
    const buttonIndex = 1;
    await deleteRights.revokeRightsOrg('GJESTFRI RESERVERT HUND DA', buttonIndex);

    //To delegate rights
    // WHEN user delegates to
    await delegate.delegateToOrg('310832170', 'GJESTFRI RESERVERT HUND DA');
    await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
    await delegateRights.delegateRightsToSSN('Automatiseringstest for Access Management');
    await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
    await logoutUser.gotoLogoutPage('OPPKLARENDE OMKOMMEN TIGER AS');
    // await context1.close();
    await context.clearCookies();

    //Login with covereby User

    await login.loginWithUser('21908498426');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');
    await coverebyRights.checkCoverebyRights();
  });

  test('DAGL/HADM do not have rights to delegate Altinn2 to org Y , but has the rights to delegate same service after delegating sens role to himself', async ({
    login,
    delegate,
    delegateRights,
    deleteRights,
    logoutUser,
    coverebyRights,
    context,
    delegateRoles,
  }) => {
    test.setTimeout(60000 * 3);

    await login.loginWithUser('03835898554');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to UINTERESSERT LØVEFLOKK
    await deleteRights.revokeRightsSSN('UINTERESSERT LØVEFLOKK');

    //To delegate rights
    // WHEN user delegates rolls to UINTERESSERT LØVEFLOKK
    await delegate.delegateToSSN('07922148605', 'LØVEFLOKK');
    await delegateRoles.delegateRole('Taushetsbelagt post', 'Hovedadministrator');
    await logoutUser.gotoLogoutPage('OPPKLARENDE OMKOMMEN TIGER AS');
    await context.clearCookies();

    await login.loginWithUser('07922148605');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');
    await deleteRights.revokeRightsSSN('STORARTET KORGSTOL');
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
      }, 500),
    );
    await delegate.delegateToSSN('07885798378', 'KORGSTOL');
    await delegateRights.delegateRightsToSSN(
      'Altinn2 sensitive reporting service for Authorizaion tests',
    );

    // await context1.close();
    await context.clearCookies();

    //Login with covereby User
    await login.loginWithUser('07885798378');
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS');
    await coverebyRights.checkCoverebyRights();
  });
});

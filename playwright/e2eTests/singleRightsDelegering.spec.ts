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
    instantiateResources,
    coverebyRights,
    delegateRoles,
    context,
  }) => {
    test.setTimeout(400000);

    await login.loginWithUser('04885299593');
    await login.chooseReportee('ULIK FLAT TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to ROMANTISK ESKE
    await deleteRights.revokeRightsSSN('SKYFRI GATE');

    //To delegate rights
    // WHEN user delegates to ROMANTISK ESKE
    await delegate.delegateToSSN('19856097121', 'GATE');
    await delegateRoles.delegateRoles(
      'Tilgangsstyring',
      'Begrenset signeringsrettighet',
      'SKYFRI GATE',
    );
    await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
    await delegateRights.delegateRightsToSSN('autorisasjon-autotest-app-2');
    await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    // await context1.close();
    await context.clearCookies();

    //Login with covereby User

    await login.loginWithUser('19856097121');
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();

    //Instantiate app to which user had got rights
    await instantiateResources.instantiateApp('ULIK FLAT TIGER AS');
    // await context.close();

    //To delegate rights
    // WHEN user delegates to KLIPPFISK
    await delegate.delegateToSSN('04880748144', 'KLIPPFISK');
    await delegateRights.delegateRightsToSSN('autorisasjon-autotest-app-2');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    await context.clearCookies();

    //Instantiate app to which user had got rights
    await login.loginWithUser('04880748144');
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();
    await instantiateResources.instantiateApp('ULIK FLAT TIGER AS');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
  });

  test('User A who is DAGL/HADM for org delegates resources/Altinn 3 app/Altinn 2 services to Org B', async ({
    login,
    delegate,
    delegateRights,
    deleteRights,
    logoutUser,
    coverebyRights,
    instantiateResources,
    delegateRoles,
    context,
  }) => {
    test.setTimeout(400000);

    await login.loginWithUser('04885299593');
    await login.chooseReportee('ULIK FLAT TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to OPPKLARENDE OMKOMMEN TIGER AS
    const buttonIndex = 1;
    await deleteRights.revokeRightsOrg('GJESTFRI RESERVERT HUND DA', buttonIndex);

    //To delegate rights
    // WHEN user delegates to
    await delegate.delegateToOrg('310832170', 'GJESTFRI RESERVERT HUND DA');
    await delegateRoles.delegateRoles(
      'Tilgangsstyring',
      'Begrenset signeringsrettighet',
      'GJESTFRI RESERVERT HUND DA',
    );
    await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
    await delegateRights.delegateRightsToSSN('autorisasjon-autotest-app-2');
    await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    // await context1.close();
    await context.clearCookies();

    //Login with covereby User

    await login.loginWithUser('21908498426');
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();

    //Instantiate app to which user had got rights
    await instantiateResources.instantiateApp('ULIK FLAT TIGER AS');
    // await context.close();

    //Delete rights
    await deleteRights.revokeRightsOrg('UNDERFUNDIG TROFAST TIGER AS', buttonIndex);

    //Delegate to another org
    await delegate.delegateToOrg('313948579', 'UNDERFUNDIG TROFAST TIGER AS');
    await delegateRights.delegateRightsToSSN('autorisasjon-autotest-app-2');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    await context.clearCookies();

    //Instantiate app to which user had got rights
    await login.loginWithUser('20860898609');
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();
    await instantiateResources.instantiateApp('ULIK FLAT TIGER AS');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
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
    test.setTimeout(60000 * 4);

    //Login with user who has tilgangstyrring rolle
    await login.loginWithUser('04885299593');
    await login.chooseReportee('ULIK FLAT TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to UINTERESSERT LØVEFLOKK
    await deleteRights.revokeRightsSSN('UINTERESSERT LØVEFLOKK');

    //To delegate rights
    // WHEN user delegates rolls to UINTERESSERT LØVEFLOKK
    await delegate.delegateToSSN('07922148605', 'LØVEFLOKK');
    await delegateRoles.delegateRole('Taushetsbelagt post', 'Hovedadministrator');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    await context.clearCookies();

    //Login with another user who has SENS role
    await login.loginWithUser('07922148605');
    await login.chooseReportee('ULIK FLAT TIGER AS');
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
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();
  });

  test('Singleright delegation - Non-delegable service', async ({
    login,
    delegate,
    delegateRights,
  }) => {
    test.setTimeout(60000 * 2);
    await login.loginWithUser('04885299593');
    await login.chooseReportee('ULIK FLAT TIGER AS');

    await delegate.delegateToSSN('19856097121', 'GATE');
    await delegateRights.nonDelegatebleRightsToSSN('Altinn2 non-delegable');
  });
});

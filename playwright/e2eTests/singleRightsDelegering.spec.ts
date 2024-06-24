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
    const buttonIndex = 1;
    await deleteRights.revokeRightsOrg('GJESTFRI RESERVERT HUND DA', buttonIndex);

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
  test('DAGL/HADM do not have rights to delegate Altinn2 to org Y , but has the rights to delegate same service after delegating sens role to himself', async ({
    login,
    delegate,
    delegateRights,
    deleteRights,
    logoutUser,
    coverebyRights,
    context,
    delegateRoles,
    page,
  }) => {
    await login.gotoLoginPage('03835898554', page);
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);

    //To delete rights - setup
    // GIVEN user without delegated rights to UINTERESSERT LØVEFLOKK
    await deleteRights.revokeRightsSSN('UINTERESSERT LØVEFLOKK');

    //To delegate rights
    // WHEN user delegates to
    await delegate.delegateToSSN('07922148605', 'LØVEFLOKK');
    await delegateRoles.delegateRole('Taushetsbelagt post', 'Tilgangsstyring');
    await logoutUser.gotoLogoutPage('OPPKLARENDE OMKOMMEN TIGER AS', page);
    await context.clearCookies();

    await login.gotoLoginPage('07922148605', page);
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);
    await delegate.delegateToSSN('07885798378', 'KORGSTOL');
    await delegateRights.delegateRightsToSSN(
      'Altinn2 sensitive reporting service for Authorizaion tests',
    );

    // await context1.close();
    await context.clearCookies();

    //Login with covereby User
    await login.gotoLoginPage('07885798378', page);
    await login.chooseReportee('OPPKLARENDE OMKOMMEN TIGER AS', page);
    await coverebyRights.checkCoverebyRights();
  });
});

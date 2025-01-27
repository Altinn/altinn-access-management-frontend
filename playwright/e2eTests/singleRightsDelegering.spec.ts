/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */

import { delegateToUser } from '../pages/profile/delegationPage';
import { test } from './../fixture/pomFixture';
test.describe('User with DAGL/HADM role without having resource access themselves', () => {
  // Testscenario:
  // Logg inn med bruker på Altinn
  // Gå til enkeltdelegering på profil
  // Gå til andre med rettigheter til virksomheten
  // Legg til ny person eller virksomhet: 24928099071: (OPPSTEMT) ABBED
  // Gi nye enkelttjenester: Velg tjeneste som ikke kan delegeres: "Altinn2 non-delegable Reporting service"
  // Du skal nå få feilmelding: Du kan ikke gi fullmakt til denne tjenesten
  test('Singleright delegation - Non-delegable service', async ({
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
    test.setTimeout(300000);

    await login.loginWithUser('04885299593');
    await login.chooseReportee('ULIK FLAT TIGER AS');

    //To delete rights - setup
    // GIVEN user without delegated rights to ROMANTISK ESKE
    //await deleteRights.revokeRightsSSN('SKYFRI GATE');

    //To delegate rights
    // WHEN user delegates to ROMANTISK ESKE
    await delegate.delegateToSSN('19856097121', 'GATE');
    await delegateRights.delegateRightsToSSN('Altinn2 non-delegable Reporting service');
  });
  /*  await delegateRoles.delegateRoles(
      'Tilgangsstyring',
      'Begrenset signeringsrettighet',
      'SKYFRI GATE',
    );
    await delegateRights.delegateRightsToSSN('Ressurs for enkeltrettigheter testing');
    await delegateRights.delegateRightsToSSN('autorisasjon-automatisert-app');
    await delegateRights.delegateRightsToSSN('Altinn2 reporting service for authorization tests');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    // await context1.close();
    await context.clearCookies();

    //Login with coveredby User

    await login.loginWithUser('19856097121');
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();

    //Instantiate app to which user had got rights
    await instantiateResources.instantiateApp('ULIK FLAT TIGER AS');
    // await context.close();

    //To delegate rights
    // WHEN user delegates to KLIPPFISK
    await delegate.delegateToSSN('04880748144', 'KLIPPFISK');
    await delegateRights.delegateRightsToSSN('autorisasjon-automatisert-app');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
    await context.clearCookies();

    //Instantiate app to which user had got rights
    await login.loginWithUser('04880748144');
    await login.chooseReportee('ULIK FLAT TIGER AS');
    await coverebyRights.checkCoverebyRights();
    await instantiateResources.instantiateApp('ULIK FLAT TIGER AS');
    await logoutUser.gotoLogoutPage('ULIK FLAT TIGER AS');
  }); */
});

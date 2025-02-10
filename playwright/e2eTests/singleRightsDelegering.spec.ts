/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
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
    await delegateRights.nonDelegatebleRightsToSSN('Altinn2 non-delegable');

    // Forsøk å deleger Altinn2 non-delegable Reporting service
    // Lag ny metode som forsøker å delegere en enkelttjeneste (dublisere fra annen metode)
    // Verifiser at det kommer opp feilmelding "Du kan ikke gi fullmakt til denne tjenesten"
  });
});

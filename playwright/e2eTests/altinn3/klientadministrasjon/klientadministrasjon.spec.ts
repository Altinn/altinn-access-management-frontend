import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe('klientadministrasjon', () => {
  const api = new EnduserConnection();

  test.beforeEach('sett opp testdata', async ({}, testInfo) => {
    switch (testInfo.title) {
      case 'slett bruker':
        await api.addClientDelegationAgent('16830197862', '311164651', '30877795760');
        await api.getClientDelegationAgents('16830197862', '311164651');
        break;
      case 'deleger klient til en bruker fra klientfanen':
        await api.addConnectionAndPackagesToUser('28868199808', '314087917', '310002224', [
          'urn:altinn:accesspackage:posttjenester',
        ]);
        await api.addClientDelegationAgent('15846199893', '310002224', '28822449737');
        break;
      case 'deleger klient til en bruker fra brukerfanen':
        await api.addConnectionAndPackagesToUser('23907296857', '313238105', '313662624', [
          'urn:altinn:accesspackage:posttjenester',
        ]);
        await api.addClientDelegationAgent('16852749125', '313662624', '47822800420');
        break;
      case 'Slett fullmakt for en bruker fra brukerfanen':
        await api.addConnectionAndPackagesToUser('12886999389', '313428435', '312772655', [
          'urn:altinn:accesspackage:posttjenester',
        ]);
        await api.addClientDelegationAgent('08873349590', '312772655', '04905999376');
        await api.delegerKlientTilBruker(
          '08873349590',
          '312772655',
          '313428435',
          '04905999376',
          'urn:altinn:accesspackage:posttjenester',
        );
        break;
      case 'Slett fullmakt for en bruker fra klientfanen':
        await api.addConnectionAndPackagesToUser('19876699047', '213836722', '310781940', [
          'urn:altinn:accesspackage:posttjenester',
        ]);
        await api.addClientDelegationAgent('21895699168', '310781940', '03924296991');
        await api.delegerKlientTilBruker(
          '21895699168',
          '310781940',
          '213836722',
          '03924296991',
          'urn:altinn:accesspackage:posttjenester',
        );
        break;
    }
  });

  test.afterEach('slett testdata', async ({}, testInfo) => {
    switch (testInfo.title) {
      case 'legg til bruker':
        await api.deleteClientDelegationAgent('09866598352', '213779702', '29814895546');
        break;
      case 'slett bruker':
        await api.deleteClientDelegationAgent('16830197862', '311164651', '30877795760');
        break;
      case 'deleger klient til en bruker fra klientfanen':
        await api.deleteConnection('28868199808', '314087917', ['310002224']);
        await api.deleteClientDelegationAgent('15846199893', '310002224', '28822449737');
        break;
      case 'deleger klient til en bruker fra brukerfanen':
        await api.deleteConnection('23907296857', '313238105', ['313662624']);
        await api.deleteClientDelegationAgent('16852749125', '313662624', '47822800420');
        break;
      case 'Slett fullmakt for en bruker fra brukerfanen':
        await api.deleteConnection('12886999389', '313428435', ['312772655']);
        await api.deleteClientDelegationAgent('08873349590', '312772655', '04905999376');
        break;
      case 'Slett fullmakt for en bruker fra klientfanen':
        await api.deleteConnection('19876699047', '213836722', ['310781940']);
        await api.deleteClientDelegationAgent('21895699168', '310781940', '03924296991');
        break;
    }
  });

  test('legg til bruker', async ({
    page,
    accessManagementFrontPage,
    klientAdministrasjonPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('09866598352');
    });

    await test.step('Velg org UVANLIG FILOSOFISK TIGER AS og gå til klientadministrasjon', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UVANLIG FILOSOFISK TIGER AS');
      await accessManagementFrontPage.goToKlientAdministrasjon();
    });

    await test.step('legg til bruker 29814895546 MUNTER SKO', async () => {
      await klientAdministrasjonPage.clickLeggTilBrukerKnapp();
      await klientAdministrasjonPage.skrivFnr('29814895546');
      await klientAdministrasjonPage.skrivEtternavn('Sko');
      await klientAdministrasjonPage.klikkLeggTilPerson();
    });

    await test.step('MUNTER SKO har nå blitt lagt til', async () => {
      await klientAdministrasjonPage.sletteKnappFinnes();
      await klientAdministrasjonPage.brukerFinnes('MUNTER SKO');
    });
  });

  test('slett bruker', async ({
    page,
    accessManagementFrontPage,
    klientAdministrasjonPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('16830197862');
    });

    await test.step('Velg org KLARTENKT UPRESIS ISBJØRN SA og gå til klientadministrasjon', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('KLARTENKT UPRESIS ISBJØRN SA');
      await accessManagementFrontPage.goToKlientAdministrasjon();
    });

    await test.step('Gå til 30877795760 TROVERDIG JUICE', async () => {
      await klientAdministrasjonPage.klikkListeElement('TROVERDIG JUICE');
    });

    await test.step('slett TROVERDIG JUICE', async () => {
      await klientAdministrasjonPage.slettBruker();
    });

    await test.step('TROVERDIG JUICE er nå slettet', async () => {
      await klientAdministrasjonPage.ingenBrukereFinnes();
    });
  });

  test('deleger klient til en bruker fra klientfanen', async ({
    page,
    accessManagementFrontPage,
    klientAdministrasjonPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('15846199893');
    });

    await test.step('Velg org TRÅDLØS FORNUFTIG KATT LYTE og gå til klientadministrasjon', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('TRÅDLØS FORNUFTIG KATT LYTE');
      await accessManagementFrontPage.goToKlientAdministrasjon();
    });

    await test.step('Gå til klientfanen og velg PARISK AKADEMISK KATT SITRON', async () => {
      await klientAdministrasjonPage.goToKlientFane();
      await klientAdministrasjonPage.klikkListeElement('PARISK AKADEMISK KATT SITRON');
    });

    await test.step('Gi SINDIG BRUD fullmakt til Posttjenester', async () => {
      await klientAdministrasjonPage.klikkAlleBrukere();
      await klientAdministrasjonPage.klikkKnapp('SINDIG BRUD');
      await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
    });

    await test.step('SINDIG BRUD finnes nå i listen over eksisterende brukere', async () => {
      await klientAdministrasjonPage.klikkBrukereMedFullmakt();
      await klientAdministrasjonPage.brukerFinnes('SINDIG BRUD');
    });

    await test.step('og har tilgangspakken Posttjenester', async () => {
      await klientAdministrasjonPage.klikkKnapp('SINDIG BRUD');
      await klientAdministrasjonPage.slettFullmaktKnappFinnes('Posttjenester');
    });
  });

  test('deleger klient til en bruker fra brukerfanen', async ({
    page,
    accessManagementFrontPage,
    klientAdministrasjonPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('16852749125');
    });

    await test.step('Velg org INTERESSERT KONVENSJONELL TIGER AS og gå til klientadministrasjon', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('INTERESSERT KONVENSJONELL TIGER AS');
      await accessManagementFrontPage.goToKlientAdministrasjon();
    });

    await test.step('velg UVANLIG FREDAG', async () => {
      await klientAdministrasjonPage.klikkListeElement('UVANLIG FREDAG');
    });

    await test.step('Gi UVANLIG FREDAG fullmakt til Posttjenester for BESTEMT SLAKK TIGER AS', async () => {
      await klientAdministrasjonPage.klikkAlleKlienter();
      await klientAdministrasjonPage.klikkKnapp('BESTEMT SLAKK TIGER AS');
      await klientAdministrasjonPage.klikkGiFullmakt('Posttjenester');
    });

    await test.step('UVANLIG FREDAG finnes nå i listen over eksisterende brukere', async () => {
      await klientAdministrasjonPage.klikkHarDisseKlientene();
      await klientAdministrasjonPage.brukerFinnes('BESTEMT SLAKK TIGER AS');
    });

    await test.step('og har tilgangspakken Posttjenester', async () => {
      await klientAdministrasjonPage.klikkKnapp('BESTEMT SLAKK TIGER AS');
      await klientAdministrasjonPage.slettFullmaktKnappFinnes('Posttjenester');
    });
  });

  test('Slett fullmakt for en bruker fra brukerfanen', async ({
    page,
    accessManagementFrontPage,
    klientAdministrasjonPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('08873349590');
    });

    await test.step('Velg org RØRETE RAKRYGGET TIGER AS og gå til klientadministrasjon', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('RØRETE RAKRYGGET TIGER AS');
      await accessManagementFrontPage.goToKlientAdministrasjon();
    });

    await test.step('Gå til klienten ROSA UNDERDANIG TIGER AS hos brukeren FORSTÅELSESFULL TRAFIKKORK', async () => {
      await klientAdministrasjonPage.klikkBruker('FORSTÅELSESFULL TRAFIKKORK');
      await klientAdministrasjonPage.klikkKnapp('ROSA UNDERDANIG TIGER AS');
    });

    await test.step('Slett fullmakt for Posttjenester', async () => {
      await klientAdministrasjonPage.slettFullmakt('Posttjenester');
    });

    await test.step('FORSTÅELSESFULL TRAFIKKORK har ingen fullmakter lenger', async () => {
      await klientAdministrasjonPage.ingenKlienterFinnes();
    });
  });

  test('Slett fullmakt for en bruker fra klientfanen', async ({
    page,
    accessManagementFrontPage,
    klientAdministrasjonPage,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Logg inn', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('21895699168');
    });

    await test.step('Velg org UAVHENGIG REALISTISK TIGER AS og gå til klientadministrasjon', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('UAVHENGIG REALISTISK TIGER AS');
      await accessManagementFrontPage.goToKlientAdministrasjon();
    });

    await test.step('Gå til brukeren ORANSJE TEST hos klienten VENSTRE GENIERKLÆRT KATT SEPARASJON', async () => {
      await klientAdministrasjonPage.goToKlientFane();
      await klientAdministrasjonPage.klikkListeElement('VENSTRE GENIERKLÆRT KATT SEPARASJON');
      await klientAdministrasjonPage.klikkKnapp('ORANSJE TEST');
    });

    await test.step('Slett fullmakt for Posttjenester', async () => {
      await klientAdministrasjonPage.slettFullmakt('Posttjenester');
    });

    await test.step('FORSTÅELSESFULL TRAFIKKORK har ingen fullmakter lenger', async () => {
      await klientAdministrasjonPage.ingenBrukereFinnes();
    });
  });
});

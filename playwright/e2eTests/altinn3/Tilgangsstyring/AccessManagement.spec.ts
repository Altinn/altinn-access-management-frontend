import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

const service = 'bruno-correspondence';

test.describe('Tilgangsstyring', () => {
  const api = new EnduserConnection();
  const org = {
    managerPid: '12816699205',
    orgNo: '314138910',
    name: 'UNDERDANIG DYPSINDIG TIGER AS',
  };

  test.describe('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', () => {
    const user = { pid: '70885100226', name: 'Iherdig Litteratur' };
    const packages = [
      'urn:altinn:accesspackage:tilgangsstyrer',
      'urn:altinn:accesspackage:posttjenester',
      'urn:altinn:accesspackage:byggesoknad',
    ];

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(org.managerPid, org.orgNo, user.pid, packages);
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(org.managerPid, org.orgNo, [user.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Tilgangsstyrer skal kunne delegere tilgangspakker de selv har', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(org.name);
      });

      await test.step(`Gå til brukere og velg bruker "${user.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
        await accessManagementFrontPage.clickUser(user.name);
      });

      await test.step('Klikk "Gi fullmakt"', async () => {
        await accessManagementFrontPage.clickGiFullmakt();
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Tilgangsstyrer"', async () => {
        await accessManagementFrontPage.goToArea('Administrere tilganger');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Posttjenester"', async () => {
        await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
      });
    });
  });

  test.describe('Hovedadministrator skal kunne delegere nesten alle tilgangspakker', () => {
    const user = { pid: '64866402394', name: 'TRÅDLØS TELEFONNUMMER' };
    const packages = ['urn:altinn:accesspackage:hovedadministrator'];

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(org.managerPid, org.orgNo, user.pid, packages);
    });

    test('Hovedadministrator skal kunne delegere nesten alle tilgangspakker', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(org.name);
      });

      await test.step('Gå til brukere og velg deg selv', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
        await accessManagementFrontPage.clickUser(user.name);
      });

      await test.step('Klikk "Gi fullmakt"', async () => {
        await accessManagementFrontPage.clickGiFullmakt();
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Administrere tilganger"-pakker', async () => {
        await accessManagementFrontPage.goToArea('Administrere tilganger');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tilgangsstyrer');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Maskinporten administrator',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Klientadministrator');
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Andre tjenesteytende næringer"-pakker', async () => {
        await accessManagementFrontPage.goToArea('Andre tjenesteytende næringer');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Finansiering og forsikring',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Informasjon og kommunikasjon',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Posttjenester');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Annen tjenesteyting');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Elektronisk kommunikasjon',
        );
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Bygg, anlegg og eiendom"-pakker', async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Motta nabo- og planvarsel',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Byggesøknad');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Plansak');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Utleie av eiendom');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Eiendomsmegler');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Tinglysing eiendom');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Oppføring av bygg og anlegg',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Kjøp og salg av eiendom');
      });

      await test.step('Brukeren skal kunne til å gi fullmakt til "Energi, vann, avløp og avfall"-pakker', async () => {
        await accessManagementFrontPage.goToArea('Energi, vann, avløp og avfall');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable('Damp- og varmtvann');
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Utvinning av råolje, naturgass og kull',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Avfall - samle inn, behandle, bruke og gjenvinne',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Miljørydding - rensing og lignende virksomhet',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Vann - ta ut fra kilde, rense og distribuere',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Elektrisitet - produsere, overføre og distribuere',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Oppføring av bygg og anlegg',
        );
        await accessManagementFrontPage.expectAccessPackageToBeDelegable(
          'Samle opp og behandle avløpsvann',
        );
      });

      await test.step('Noen pakker skal ikke kunne delegeres', async () => {
        await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
          'Konkursbo administrator',
        );
        await accessManagementFrontPage.expectAccessPackageToNotBeDelegable(
          'Eksplisitt tjenestedelegering',
        );
      });
    });
  });

  test.describe('Vanlig bruker skal ikke kunne delegere pakker de selv ikke har tilgang til', () => {
    const user = { pid: '15843346194', name: 'DYREBAR MIDDAG' };
    const packages = [
      'urn:altinn:accesspackage:tilgangsstyrer',
      'urn:altinn:accesspackage:byggesoknad',
    ];

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(org.managerPid, org.orgNo, user.pid, packages);
    });

    test('Vanlig bruker skal ikke kunne delegere pakker de selv ikke har tilgang til', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(org.name);
      });

      await test.step('Gå til brukere-siden og velg deg selv', async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expectOthersWithRightsListToBeVisible();
        await accessManagementFrontPage.clickUser(user.name);
      });

      await test.step('User should not be able to give power of attorney to themselves', async () => {
        await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
      });
    });
  });

  test.describe('Standard bruker skal kun kunne se deg selv på brukere-siden', () => {
    const user = { pid: '22907997719' };
    const packages = ['urn:altinn:accesspackage:byggesoknad'];

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(org.managerPid, org.orgNo, user.pid, packages);
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(org.managerPid, org.orgNo, [user.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Standard bruker skal kun kunne se deg selv på brukere-siden', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Log in', async () => {
        await login.LoginToAccessManagement(user.pid);
      });

      await test.step(`Velg org ${org.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(org.name);
      });

      await test.step('Gå til brukere-siden', async () => {
        await accessManagementFrontPage.goToUsers();
      });

      await test.step('Brukeren skal ikke kunne gi fullmakt til deg selv', async () => {
        await accessManagementFrontPage.expectPowerOfAttorneyButtonToNotBeVisible();
      });
    });
  });
});

test.describe('over- og underenheter', () => {
  const api = new EnduserConnection();

  test.describe('Virksomhet skal kunne se tilgangspakker hos hoved- og underenhet som delegerte dem', () => {
    const delegatorOrg = {
      managerPid: '25916799929',
      orgNo: '313819566',
      name: 'SMISKENDE UMODEN TIGER AS',
    };
    const recipientOrg = {
      managerPid: '30847798242',
      orgNo: '313244555',
      name: 'KONSERVATIV USELVISK KATT KLINKEKULE',
    };

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(
        delegatorOrg.managerPid,
        delegatorOrg.orgNo,
        recipientOrg.orgNo,
        ['urn:altinn:accesspackage:byggesoknad'],
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(delegatorOrg.managerPid, delegatorOrg.orgNo, [
          recipientOrg.orgNo,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Virksomhet skal kunne se tilgangspakker hos hoved- og underenhet som delegerte dem', async ({
      accessManagementFrontPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(recipientOrg.managerPid);
      });

      await test.step(`Se at hovedenhet og underenhet for ${delegatorOrg.name} er klikkbare i aktørlista`, async () => {
        await aktorvalgHeader.orgExistsInAktorvalg(delegatorOrg.name);
        await aktorvalgHeader.subOrgExistsInAktorvalg(delegatorOrg.name);
      });

      await test.step(`Velg hovedenhet ${recipientOrg.name} og gå til fullmakter hos andre`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(recipientOrg.name);
        await accessManagementFrontPage.goToFullmakterHosAndre();
      });

      await test.step(`Velg hovedenhet ${delegatorOrg.name} i lista over fullmakter hos andre`, async () => {
        await accessManagementFrontPage.expandOrg(delegatorOrg.name);
        await accessManagementFrontPage.clickUser(delegatorOrg.name);
      });

      await test.step(`${recipientOrg.name} skal ha tilgangspakken Byggesøknad hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.userCanDeletePackage('Byggesøknad');
      });

      await test.step(`Gå tilbake til fullmakter hos andre og velg underenhet ${delegatorOrg.name}`, async () => {
        await accessManagementFrontPage.goToFullmakterHosAndre();
        await accessManagementFrontPage.expandOrg(delegatorOrg.name);
        await accessManagementFrontPage.clickUser(delegatorOrg.name, 1);
      });

      await test.step(`${recipientOrg.name} skal ha tilgangspakken Byggesøknad hos underenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.expectUserToHavePackage('Byggesøknad');
      });
    });
  });

  test.describe('Underenhet A som delegerte tilgangspakke til Virksomhet B skal kunne se Virksomhet B i brukerlista si', () => {
    const delegatorOrg = {
      managerPid: '12828099912',
      orgNo: '312160862',
      name: 'INITIATIVRIK TOM TIGER AS',
    };
    const recipientOrg = { orgNo: '313244555', name: 'KONSERVATIV USELVISK KATT KLINKEKULE' };

    test.beforeEach(async () => {
      await api.addConnectionAndPackagesToUser(
        delegatorOrg.managerPid,
        delegatorOrg.orgNo,
        recipientOrg.orgNo,
        ['urn:altinn:accesspackage:byggesoknad'],
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteConnection(delegatorOrg.managerPid, delegatorOrg.orgNo, [
          recipientOrg.orgNo,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Underenhet A som delegerte tilgangspakke til Virksomhet B skal kunne se Virksomhet B i brukerlista si', async ({
      accessManagementFrontPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegatorOrg.managerPid);
      });

      await test.step(`Velg underenhet ${delegatorOrg.name} og gå til brukere`, async () => {
        await aktorvalgHeader.selectSubOrgFromHeaderMenu(delegatorOrg.name);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.name} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.name);
        await accessManagementFrontPage.clickUser(recipientOrg.name);
      });

      await test.step(`${recipientOrg.name} skal ha tilgangspakken Byggesøknad hos underenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.expectUserToHavePackage('Byggesøknad');
      });

      await test.step(`Velg hovedenhet ${delegatorOrg.name} og gå til brukere`, async () => {
        await aktorvalgHeader.goToSelectActor(delegatorOrg.name);
        await aktorvalgHeader.selectActorFromHeaderMenu(delegatorOrg.name);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.name} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.name);
        await accessManagementFrontPage.clickUser(recipientOrg.name);
      });

      await test.step(`${recipientOrg.name} skal ha tilgangspakken Byggesøknad hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToArea('Bygg, anlegg og eiendom');
        await accessManagementFrontPage.userCanDeletePackage('Byggesøknad');
      });
    });
  });

  test.describe('Virksomhet skal kunne se enkelttjenester hos hoved- og underenhet som delegerte dem', () => {
    const delegatorOrg = {
      managerPid: '26888197213',
      orgNo: '310959502',
      name: 'RIKTIG AUTENTISK APE',
    };
    const recipientOrg = {
      managerPid: '16906997766',
      orgNo: '312791404',
      name: 'FORMBAR GENIERKLÆRT TIGER AS',
    };

    test.beforeEach(async () => {
      await api.addConnection(delegatorOrg.managerPid, delegatorOrg.orgNo, recipientOrg.orgNo);
      await api.delegateSingleService(
        delegatorOrg.managerPid,
        delegatorOrg.orgNo,
        recipientOrg.orgNo,
        service,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegatorOrg.managerPid,
          delegatorOrg.orgNo,
          recipientOrg.orgNo,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegatorOrg.managerPid, delegatorOrg.orgNo, [
          recipientOrg.orgNo,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Virksomhet skal kunne se enkelttjenester hos hoved- og underenhet som delegerte dem', async ({
      accessManagementFrontPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(recipientOrg.managerPid);
      });

      await test.step(`Se at hovedenhet og underenhet for ${delegatorOrg.name} er klikkbare i aktørlista`, async () => {
        await aktorvalgHeader.orgExistsInAktorvalg(delegatorOrg.name);
        await aktorvalgHeader.subOrgExistsInAktorvalg(delegatorOrg.name);
      });

      await test.step(`Velg hovedenhet ${recipientOrg.name} og gå til fullmakter hos andre`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(recipientOrg.name);
        await accessManagementFrontPage.goToFullmakterHosAndre();
      });

      await test.step(`Velg hovedenhet ${delegatorOrg.name} i lista over fullmakter hos andre`, async () => {
        await accessManagementFrontPage.expandOrg(delegatorOrg.name);
        await accessManagementFrontPage.clickUser(delegatorOrg.name);
      });

      await test.step(`${recipientOrg.name} skal ha enkelttjenesten ${service} hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });

      await test.step(`Gå tilbake til fullmakter hos andre og velg underenhet ${delegatorOrg.name}`, async () => {
        await accessManagementFrontPage.goToFullmakterHosAndre();
        await accessManagementFrontPage.expandOrg(delegatorOrg.name);
        await accessManagementFrontPage.clickUser(delegatorOrg.name, 1);
      });

      await test.step(`${recipientOrg.name} skal ha enkelttjenesten ${service} hos underenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.expectUserToHaveEnkelttjeneste(service);
      });
    });
  });

  test.describe('Underenhet A som delegerte enkelttjeneste til Virksomhet B skal kunne se Virksomhet B i brukerlista si', () => {
    const delegatorOrg = {
      managerPid: '15817195900',
      orgNo: '313019020',
      name: 'KLOK VÅRLIG TIGER AS',
    };
    const recipientOrg = { orgNo: '312791404', name: 'FORMBAR GENIERKLÆRT TIGER AS' };

    test.beforeEach(async () => {
      await api.addConnection(delegatorOrg.managerPid, delegatorOrg.orgNo, recipientOrg.orgNo);
      await api.delegateSingleService(
        delegatorOrg.managerPid,
        delegatorOrg.orgNo,
        recipientOrg.orgNo,
        service,
      );
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegatorOrg.managerPid,
          delegatorOrg.orgNo,
          recipientOrg.orgNo,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegatorOrg.managerPid, delegatorOrg.orgNo, [
          recipientOrg.orgNo,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Underenhet A som delegerte enkelttjeneste til Virksomhet B skal kunne se Virksomhet B i brukerlista si', async ({
      accessManagementFrontPage,
      login,
      aktorvalgHeader,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegatorOrg.managerPid);
      });

      await test.step(`Velg underenhet ${delegatorOrg.name} og gå til brukere`, async () => {
        await aktorvalgHeader.selectSubOrgFromHeaderMenu(delegatorOrg.name);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.name} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.name);
        await accessManagementFrontPage.clickUser(recipientOrg.name);
      });

      await test.step(`${recipientOrg.name} skal ha enkelttjenesten ${service} hos underenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });

      await test.step(`Velg hovedenhet ${delegatorOrg.name} og gå til brukere`, async () => {
        await aktorvalgHeader.goToSelectActor(delegatorOrg.name);
        await aktorvalgHeader.selectActorFromHeaderMenu(delegatorOrg.name);
        await accessManagementFrontPage.goToUsers();
      });

      await test.step(`Velg ${recipientOrg.name} i lista over brukere`, async () => {
        await accessManagementFrontPage.expandOrg(recipientOrg.name);
        await accessManagementFrontPage.clickUser(recipientOrg.name);
      });

      await test.step(`${recipientOrg.name} skal ha enkelttjenesten ${service} hos hovedenheten`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });
});

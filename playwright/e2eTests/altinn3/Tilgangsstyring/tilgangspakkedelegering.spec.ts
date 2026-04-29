import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import { tenorTestdata } from '../../testdata/tilgangsstyring/testdataHelpers';

test.describe('tilgangspakkedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();
  const UTDANNING_PACKAGE = 'Utdanning';
  const UTDANNING_AREA = 'Arbeidsliv, skole og utdanning';
  const SAMLIV_PACKAGE_URN = 'urn:altinn:accesspackage:innbygger-samliv';
  const SAMLIV_PACKAGE = 'Samliv';
  const SAMLIV_AREA = 'Familie og fritid';

  const addPerson = {
    loginPid: tenorTestdata[0].pid,
    actor: tenorTestdata[0].orgName,
    targetPid: '52858201748',
    targetSearchName: 'KOMPOSISJON',
    targetName: 'MEMORERENDE KOMPOSISJON',
  };
  const addOrg = {
    loginPid: tenorTestdata[1].pid,
    actor: tenorTestdata[1].orgName,
    targetOrgNo: '210638962',
    targetName: 'EKTE FANTASIFULL KATT HIMMEL',
  };
  const delegateToPerson = {
    loginPid: tenorTestdata[2].pid,
    actor: tenorTestdata[2].orgName,
    targetPid: '22911648052',
    targetName: 'LETT ANKEL',
  };
  const delegateToOrg = {
    loginPid: tenorTestdata[3].pid,
    actor: tenorTestdata[3].orgName,
    targetOrgNo: '313904490',
    targetName: 'OPPLYST KVART TIGER AS',
  };
  const deleteFromPerson = {
    loginPid: tenorTestdata[4].pid,
    actor: tenorTestdata[4].orgName,
    targetPid: '43818900555',
    targetName: 'OPPSTEMT DRAGE',
  };
  const deleteFromOrg = {
    loginPid: tenorTestdata[5].pid,
    actor: tenorTestdata[5].orgName,
    targetOrgNo: '313435482',
    targetName: 'GILD SPESIELL TIGER AS',
  };

  test.afterAll('slett testdata', async () => {
    for (const [pid, target] of [
      [deleteFromOrg.loginPid, deleteFromOrg.targetOrgNo],
      [addPerson.loginPid, addPerson.targetPid],
      [addOrg.loginPid, addOrg.targetOrgNo],
      [delegateToPerson.loginPid, delegateToPerson.targetPid],
      [delegateToOrg.loginPid, delegateToOrg.targetOrgNo],
      [deleteFromPerson.loginPid, deleteFromPerson.targetPid],
    ] as [string, string][]) {
      try {
        await api.deleteConnection(pid, pid, [target]);
      } catch (e) {
        console.error('Cleanup: deleteConnection feilet:', e);
      }
    }
  });

  test('Legg til ny person hos deg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(addPerson.loginPid);
    });

    await test.step(`Velg org ${addPerson.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(addPerson.actor);
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step(`Legg til personen ${addPerson.targetPid} ${addPerson.targetName}`, async () => {
      await accessManagementFrontPage.addPerson(addPerson.targetPid, addPerson.targetSearchName);
    });

    await test.step(`${addPerson.targetName} finnes i listen over brukere`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(addPerson.targetName);
    });
  });

  test('Legg til ny virksomhet hos deg selv', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(addOrg.loginPid);
    });

    await test.step(`Velg org ${addOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(addOrg.actor);
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step(`Legg til virksomheten ${addOrg.targetOrgNo} ${addOrg.targetName}`, async () => {
      await accessManagementFrontPage.addOrg(addOrg.targetOrgNo);
    });

    await test.step(`${addOrg.targetOrgNo} finnes i listen over brukere`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(addOrg.targetName);
      await accessManagementFrontPage.clickUser(addOrg.targetName);
    });
  });

  test('Deleger tilgangspakke til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.deleteConnection(delegateToPerson.loginPid, delegateToPerson.loginPid, [
        delegateToPerson.targetPid,
      ]);
      await api.addConnection(
        delegateToPerson.loginPid,
        delegateToPerson.loginPid,
        delegateToPerson.targetPid,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(delegateToPerson.loginPid);
    });

    await test.step(`Velg deg selv (${delegateToPerson.actor}) og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(delegateToPerson.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${delegateToPerson.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(delegateToPerson.targetName);
    });

    await test.step(`Gi ${delegateToPerson.targetName} fullmakt til tilgangspakken "Utdanning"`, async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(UTDANNING_AREA);
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(UTDANNING_PACKAGE);
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${delegateToPerson.targetName} skal ha tilgangspakken "Utdanning"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(delegateToPerson.targetName);
      await accessManagementFrontPage.goToArea(UTDANNING_AREA);
      await accessManagementFrontPage.expectUserToHavePackage(UTDANNING_PACKAGE);
    });
  });

  test('Deleger tilgangspakke til virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        delegateToOrg.loginPid,
        delegateToOrg.loginPid,
        delegateToOrg.targetOrgNo,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(delegateToOrg.loginPid);
    });

    await test.step(`Velg org ${delegateToOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(delegateToOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${delegateToOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(delegateToOrg.targetName);
      await accessManagementFrontPage.clickUser(delegateToOrg.targetName);
    });

    await test.step(`Gi ${delegateToOrg.targetName} fullmakt til tilgangspakken "Utdanning"`, async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(UTDANNING_AREA);
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(UTDANNING_PACKAGE);
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${delegateToOrg.targetName} skal ha tilgangspakken "Utdanning"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(delegateToOrg.targetName);
      await accessManagementFrontPage.clickUser(delegateToOrg.targetName);
      await accessManagementFrontPage.goToArea(UTDANNING_AREA);
      await accessManagementFrontPage.expectUserToHavePackage(UTDANNING_PACKAGE);
    });
  });

  test('Slett tilgangspakke hos person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser(
        deleteFromPerson.loginPid,
        deleteFromPerson.loginPid,
        deleteFromPerson.targetPid,
        [SAMLIV_PACKAGE_URN],
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteFromPerson.loginPid);
    });

    await test.step(`Velg deg selv (${deleteFromPerson.actor}) og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteFromPerson.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteFromPerson.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteFromPerson.targetName);
    });

    await test.step(`Slett "Samliv" fullmakten for ${deleteFromPerson.targetName}`, async () => {
      await accessManagementFrontPage.goToArea(SAMLIV_AREA);
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(SAMLIV_PACKAGE);
    });

    await test.step(`${deleteFromPerson.targetName} ikke skal ha tilgangspakken "Samliv"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteFromPerson.targetName);
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(SAMLIV_AREA);
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(SAMLIV_PACKAGE);
    });
  });

  test('Slett tilgangspakke hos virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser(
        deleteFromOrg.loginPid,
        deleteFromOrg.loginPid,
        deleteFromOrg.targetOrgNo,
        [SAMLIV_PACKAGE_URN],
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteFromOrg.loginPid);
    });

    await test.step(`Velg org ${deleteFromOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteFromOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteFromOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
    });

    await test.step(`Slett "Samliv" fullmakten for ${deleteFromOrg.targetName}`, async () => {
      await accessManagementFrontPage.goToArea(SAMLIV_AREA);
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(SAMLIV_PACKAGE);
    });

    await test.step(`${deleteFromOrg.targetName} ikke skal ha tilgangspakken "Samliv"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(SAMLIV_AREA);
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(SAMLIV_PACKAGE);
    });
  });
});

test.describe('tilgangspakkedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();
  const POST_PACKAGE_URN = 'urn:altinn:accesspackage:posttjenester';
  const POST_PACKAGE = 'Posttjenester';
  const POST_AREA = 'Andre tjenesteytende næringer';

  const addPerson = {
    loginPid: tenorTestdata[6].pid,
    orgNo: tenorTestdata[6].orgNr,
    actor: tenorTestdata[6].orgName,
    targetPid: '41926701744',
    targetSearchName: 'APRIKOS',
    targetName: 'OMSORGSFULL APRIKOS',
  };
  const addOrg = {
    loginPid: tenorTestdata[7].pid,
    orgNo: tenorTestdata[7].orgNr,
    actor: tenorTestdata[7].orgName,
    targetOrgNo: '212209562',
    targetName: 'ALLSIDIG SIGEN TIGER AS',
  };
  const delegateToPerson = {
    loginPid: tenorTestdata[8].pid,
    orgNo: tenorTestdata[8].orgNr,
    actor: tenorTestdata[8].orgName,
    targetPid: '26832047936',
    targetName: 'UFØLSOM BADERING',
  };
  const delegateToOrg = {
    loginPid: tenorTestdata[9].pid,
    orgNo: tenorTestdata[9].orgNr,
    actor: tenorTestdata[9].orgName,
    targetOrgNo: '312188198',
    targetName: 'EVENTYRLIG PUSLETE TIGER AS',
  };
  const deleteFromPerson = {
    loginPid: tenorTestdata[10].pid,
    orgNo: tenorTestdata[10].orgNr,
    actor: tenorTestdata[10].orgName,
    targetPid: '18894799990',
    targetName: 'UTROLIG KLØVER',
  };
  const deleteFromOrg = {
    loginPid: tenorTestdata[11].pid,
    orgNo: tenorTestdata[11].orgNr,
    actor: tenorTestdata[11].orgName,
    targetOrgNo: '312861305',
    targetName: 'GRATIS RØD APE',
  };

  test.afterAll('slett testdata', async () => {
    for (const { pid, org, target } of [
      { pid: addPerson.loginPid, org: addPerson.orgNo, target: addPerson.targetPid },
      { pid: addOrg.loginPid, org: addOrg.orgNo, target: addOrg.targetOrgNo },
      {
        pid: delegateToPerson.loginPid,
        org: delegateToPerson.orgNo,
        target: delegateToPerson.targetPid,
      },
      { pid: delegateToOrg.loginPid, org: delegateToOrg.orgNo, target: delegateToOrg.targetOrgNo },
      {
        pid: deleteFromPerson.loginPid,
        org: deleteFromPerson.orgNo,
        target: deleteFromPerson.targetPid,
      },
      { pid: deleteFromOrg.loginPid, org: deleteFromOrg.orgNo, target: deleteFromOrg.targetOrgNo },
    ]) {
      try {
        await api.deleteConnection(pid, org, [target]);
      } catch (e) {
        console.error('Cleanup: deleteConnection feilet:', e);
      }
    }
  });

  test('Legg til ny person hos din org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(addPerson.loginPid);
    });

    await test.step(`Velg org ${addPerson.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(addPerson.actor);
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step(`Legg til personen ${addPerson.targetPid} ${addPerson.targetName}`, async () => {
      await accessManagementFrontPage.addPerson(addPerson.targetPid, addPerson.targetSearchName);
    });

    await test.step(`${addPerson.targetPid} ${addPerson.targetName} finnes i listen over brukere`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(addPerson.targetName);
    });
  });

  test('Legg til ny virksomhet hos din org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(addOrg.loginPid);
    });

    await test.step(`Velg org ${addOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(addOrg.actor);
    });

    await test.step('Gå til brukere-siden og klikk "legg til bruker"', async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickLeggTilBruker();
    });

    await test.step(`Legg til virksomheten ${addOrg.targetOrgNo} ${addOrg.targetName}`, async () => {
      await accessManagementFrontPage.addOrg(addOrg.targetOrgNo);
    });

    await test.step(`${addOrg.targetName} finnes i listen over brukere`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(addOrg.targetName);
      await accessManagementFrontPage.clickUser(addOrg.targetName);
    });
  });

  test('Deleger tilgangspakke til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        delegateToPerson.loginPid,
        delegateToPerson.orgNo,
        delegateToPerson.targetPid,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(delegateToPerson.loginPid);
    });

    await test.step(`Velg org ${delegateToPerson.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(delegateToPerson.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${delegateToPerson.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(delegateToPerson.targetName);
    });

    await test.step(`Gi ${delegateToPerson.targetName} fullmakt til tilgangspakken "Posttjenester"`, async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(POST_PACKAGE);
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${delegateToPerson.targetName} skal ha tilgangspakken "Posttjenester"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(delegateToPerson.targetName);
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.expectUserToHavePackage(POST_PACKAGE);
    });
  });

  test('Deleger tilgangspakke til virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        delegateToOrg.loginPid,
        delegateToOrg.orgNo,
        delegateToOrg.targetOrgNo,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(delegateToOrg.loginPid);
    });

    await test.step(`Velg org ${delegateToOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(delegateToOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${delegateToOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(delegateToOrg.targetName);
      await accessManagementFrontPage.clickUser(delegateToOrg.targetName);
    });

    await test.step(`Gi ${delegateToOrg.targetName} fullmakt til tilgangspakken "Posttjenester"`, async () => {
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.clickGiFullmaktForTilgangspakke(POST_PACKAGE);
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${delegateToOrg.targetName} skal ha tilgangspakken "Posttjenester"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(delegateToOrg.targetName);
      await accessManagementFrontPage.clickUser(delegateToOrg.targetName);
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.expectUserToHavePackage(POST_PACKAGE);
    });
  });

  test('Slett tilgangspakke hos person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser(
        deleteFromPerson.loginPid,
        deleteFromPerson.orgNo,
        deleteFromPerson.targetPid,
        [POST_PACKAGE_URN],
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteFromPerson.loginPid);
    });

    await test.step(`Velg deg org ${deleteFromPerson.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteFromPerson.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteFromPerson.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteFromPerson.targetName);
    });

    await test.step(`Slett tilgangspakken "Posttjenester" for ${deleteFromPerson.targetName}`, async () => {
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(POST_PACKAGE);
    });

    await test.step(`${deleteFromPerson.targetName} ikke skal ha tilgangspakken "Posttjenester"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteFromPerson.targetName);
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(POST_PACKAGE);
    });
  });

  test('Slett tilgangspakke hos virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser(
        deleteFromOrg.loginPid,
        deleteFromOrg.orgNo,
        deleteFromOrg.targetOrgNo,
        [POST_PACKAGE_URN],
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteFromOrg.loginPid);
    });

    await test.step(`Velg org ${deleteFromOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteFromOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteFromOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
    });

    await test.step(`Slett "Posttjenester" fullmakten for ${deleteFromOrg.targetName}`, async () => {
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.clickSlettFullmaktForTilgangspakke(POST_PACKAGE);
    });

    await test.step(`${deleteFromOrg.targetName} ikke skal ha tilgangspakken "Posttjenester"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.goToArea(POST_AREA);
      await accessManagementFrontPage.expectAccessPackageToBeDelegable(POST_PACKAGE);
    });
  });
});

import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from '../../../fixture/pomFixture';
import { AktorvalgHeader } from '../../../pages/AktorvalgHeader';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';
import { tenorTestdata } from '../../testdata/tilgangsstyring/testdataHelpers';

const SINGLE_SERVICE = 'bruno-correspondence';

test.describe('Enkelttjenestedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  const delegateToPerson = {
    loginPid: tenorTestdata[12].pid,
    actor: tenorTestdata[12].orgName,
    targetPid: '23854897845',
    targetName: 'KONSERVATIV FATTIGMANNSKOST',
  };
  const delegateToOrg = {
    loginPid: tenorTestdata[13].pid,
    actor: tenorTestdata[13].orgName,
    targetOrgNo: '313642291',
    targetName: 'OVERFLØDIG SOLID TIGER AS',
  };
  const deleteFromPerson = {
    loginPid: tenorTestdata[14].pid,
    actor: tenorTestdata[14].orgName,
    targetPid: '50907400120',
    targetName: 'VASSEN ERT',
  };
  const deleteFromOrg = {
    loginPid: tenorTestdata[15].pid,
    actor: tenorTestdata[15].orgName,
    targetOrgNo: '210530932',
    targetName: 'TYDELIG VIS TIGER AS',
  };

  test.afterAll('slett testdata', async () => {
    for (const [pid, target] of [
      [deleteFromOrg.loginPid, deleteFromOrg.targetOrgNo],
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

  test('Deleger enkelttjeneste til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
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

    await test.step(`Gi ${delegateToPerson.targetName} fullmakt til enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${delegateToPerson.targetName} skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(delegateToPerson.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste(SINGLE_SERVICE);
    });
  });

  test('Deleger enkelttjeneste til virksomhet', async ({ page, accessManagementFrontPage }) => {
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

    await test.step(`Gi ${delegateToOrg.targetName} fullmakt til enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${delegateToOrg.targetName} skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(delegateToOrg.targetName);
      await accessManagementFrontPage.clickUser(delegateToOrg.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste(SINGLE_SERVICE);
    });
  });

  test('Slett enkelttjenestedelegering hos person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        deleteFromPerson.loginPid,
        deleteFromPerson.loginPid,
        deleteFromPerson.targetPid,
      );
      await api.delegateSingleService(
        deleteFromPerson.loginPid,
        deleteFromPerson.loginPid,
        deleteFromPerson.targetPid,
        SINGLE_SERVICE,
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

    await test.step(`slett "bruno-correspondence" for ${deleteFromPerson.targetName}`, async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste(SINGLE_SERVICE);
    });

    await test.step(`${deleteFromPerson.targetName} ikke skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteFromPerson.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(SINGLE_SERVICE);
    });
  });

  test('Slett enkelttjeneste hos virksomhet', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        deleteFromOrg.loginPid,
        deleteFromOrg.loginPid,
        deleteFromOrg.targetOrgNo,
      );
      await api.delegateSingleService(
        deleteFromOrg.loginPid,
        deleteFromOrg.loginPid,
        deleteFromOrg.targetOrgNo,
        SINGLE_SERVICE,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteFromOrg.loginPid);
    });

    await test.step(`Velg deg selv (${deleteFromOrg.actor}) og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteFromOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteFromOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
    });

    await test.step(`slett "bruno-correspondence" for ${deleteFromOrg.targetName}`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste(SINGLE_SERVICE);
    });

    await test.step(`${deleteFromOrg.targetName} ikke skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteFromOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteFromOrg.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(SINGLE_SERVICE);
    });
  });
});

test.describe('Enkelttjenestedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();

  const orgToPerson = {
    loginPid: tenorTestdata[16].pid,
    orgNo: tenorTestdata[16].orgNr,
    actor: tenorTestdata[16].orgName,
    targetPid: '17889574100',
    targetName: 'ANSVARSFULL REGLE',
  };
  const orgToOrg = {
    loginPid: tenorTestdata[17].pid,
    orgNo: tenorTestdata[17].orgNr,
    actor: tenorTestdata[17].orgName,
    targetOrgNo: '313233383',
    targetName: 'RIK INNBRINGENDE TIGER AS',
  };
  const deleteOrgToPerson = {
    loginPid: tenorTestdata[18].pid,
    orgNo: tenorTestdata[18].orgNr,
    actor: tenorTestdata[18].orgName,
    targetPid: '09893049719',
    targetName: 'ANSTENDIG PURRE',
  };
  const deleteOrgToOrg = {
    loginPid: tenorTestdata[19].pid,
    orgNo: tenorTestdata[19].orgNr,
    actor: tenorTestdata[19].orgName,
    targetOrgNo: '314021622',
    targetName: 'SKAMFULL KONKRET TIGER AS',
  };

  test.afterAll('slett testdata', async () => {
    for (const { pid, org, target } of [
      { pid: orgToPerson.loginPid, org: orgToPerson.orgNo, target: orgToPerson.targetPid },
      { pid: orgToOrg.loginPid, org: orgToOrg.orgNo, target: orgToOrg.targetOrgNo },
      {
        pid: deleteOrgToPerson.loginPid,
        org: deleteOrgToPerson.orgNo,
        target: deleteOrgToPerson.targetPid,
      },
      {
        pid: deleteOrgToOrg.loginPid,
        org: deleteOrgToOrg.orgNo,
        target: deleteOrgToOrg.targetOrgNo,
      },
    ]) {
      try {
        await api.deleteConnection(pid, org, [target]);
      } catch (e) {
        console.error('Cleanup: deleteConnection feilet:', e);
      }
    }
  });

  test('Deleger enkelttjeneste fra org til person', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(orgToPerson.loginPid, orgToPerson.orgNo, orgToPerson.targetPid);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(orgToPerson.loginPid);
    });

    await test.step(`Velg org ${orgToPerson.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(orgToPerson.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${orgToPerson.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(orgToPerson.targetName);
    });

    await test.step(`Gi ${orgToPerson.targetName} fullmakt til enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${orgToPerson.targetName} skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(orgToPerson.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste(SINGLE_SERVICE);
    });
  });

  test('Deleger enkelttjeneste fra org til org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(orgToOrg.loginPid, orgToOrg.orgNo, orgToOrg.targetOrgNo);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(orgToOrg.loginPid);
    });

    await test.step(`Velg org ${orgToOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(orgToOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${orgToOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(orgToOrg.targetName);
      await accessManagementFrontPage.clickUser(orgToOrg.targetName);
    });

    await test.step(`Gi ${orgToOrg.targetName} fullmakt til enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
      await accessManagementFrontPage.LukkGiFullmaktVindu();
    });

    await test.step(`${orgToOrg.targetName} skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(orgToOrg.targetName);
      await accessManagementFrontPage.clickUser(orgToOrg.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.expectUserToHaveEnkelttjeneste(SINGLE_SERVICE);
    });
  });

  test('Slett enkelttjenestedelegering fra org til person', async ({
    page,
    accessManagementFrontPage,
  }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        deleteOrgToPerson.loginPid,
        deleteOrgToPerson.orgNo,
        deleteOrgToPerson.targetPid,
      );
      await api.delegateSingleService(
        deleteOrgToPerson.loginPid,
        deleteOrgToPerson.orgNo,
        deleteOrgToPerson.targetPid,
        SINGLE_SERVICE,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteOrgToPerson.loginPid);
    });

    await test.step(`Velg deg selv (${deleteOrgToPerson.actor}) og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteOrgToPerson.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteOrgToPerson.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteOrgToPerson.targetName);
    });

    await test.step(`slett "bruno-correspondence" for ${deleteOrgToPerson.targetName}`, async () => {
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste(SINGLE_SERVICE);
    });

    await test.step(`${deleteOrgToPerson.targetName} ikke skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.clickUser(deleteOrgToPerson.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(SINGLE_SERVICE);
    });
  });

  test('Slett enkelttjeneste fra org til org', async ({ page, accessManagementFrontPage }) => {
    const login = new LoginPage(page);
    const aktorvalgHeader = new AktorvalgHeader(page);
    await test.step('sett opp testdata', async () => {
      await api.addConnection(
        deleteOrgToOrg.loginPid,
        deleteOrgToOrg.orgNo,
        deleteOrgToOrg.targetOrgNo,
      );
      await api.delegateSingleService(
        deleteOrgToOrg.loginPid,
        deleteOrgToOrg.orgNo,
        deleteOrgToOrg.targetOrgNo,
        SINGLE_SERVICE,
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(deleteOrgToOrg.loginPid);
    });

    await test.step(`Velg deg org ${deleteOrgToOrg.actor} og gå til tilgangsstyring`, async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(deleteOrgToOrg.actor);
    });

    await test.step(`Gå til brukere-siden og klikk på "${deleteOrgToOrg.targetName}"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteOrgToOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteOrgToOrg.targetName);
    });

    await test.step(`slett "bruno-correspondence" for ${deleteOrgToOrg.targetName}`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteOrgToOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteOrgToOrg.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickSlettEnkelttjeneste(SINGLE_SERVICE);
    });

    await test.step(`${deleteOrgToOrg.targetName} ikke skal ha enkelttjenesten "bruno-correspondence"`, async () => {
      await accessManagementFrontPage.goToUsers();
      await accessManagementFrontPage.expandOrg(deleteOrgToOrg.targetName);
      await accessManagementFrontPage.clickUser(deleteOrgToOrg.targetName);
      await accessManagementFrontPage.goToEnkelttjenester();
      await accessManagementFrontPage.clickGiFullmakt();
      await accessManagementFrontPage.sokEtterEnkelttjeneste(SINGLE_SERVICE);
      await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(SINGLE_SERVICE);
    });
  });
});

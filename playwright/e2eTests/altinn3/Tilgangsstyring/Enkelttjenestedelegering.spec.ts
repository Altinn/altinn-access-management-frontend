import { test } from '../../../fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

const service = 'bruno-correspondence';

test.describe('Enkelttjenestedelegering fra person til person og person til org', () => {
  const api = new EnduserConnection();

  test.describe('Deleger enkelttjeneste til person', () => {
    const delegator = { pid: '03906197811', name: 'STRAFFET KOST' };
    const recipient = { pid: '23854897845', name: 'KONSERVATIV FATTIGMANNSKOST' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.pid, recipient.pid);
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.pid,
          recipient.pid,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.pid, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.name}) og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Deleger enkelttjeneste til virksomhet', () => {
    const delegator = { pid: '23813949784', name: 'ORIENTAL TRAPP' };
    const recipient = { orgNo: '313642291', name: 'OVERFLØDIG SOLID TIGER AS' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.pid, recipient.orgNo);
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.pid,
          recipient.orgNo,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.pid, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste til virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Slett enkelttjenestedelegering hos person', () => {
    const delegator = { pid: '13894599892', name: 'SØT KOMPETANSE' };
    const recipient = { pid: '50907400120', name: 'VASSEN ERT' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.pid, recipient.pid);
      await api.delegateSingleService(delegator.pid, delegator.pid, recipient.pid, service);
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.pid,
            recipient.pid,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.pid, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjenestedelegering hos person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.name}) og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });

  test.describe('Slett enkelttjeneste hos virksomhet', () => {
    const delegator = { pid: '09889499432', name: 'KOMPLEKS BØNNE' };
    const recipient = { orgNo: '210530932', name: 'TYDELIG VIS TIGER AS' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.pid, recipient.orgNo);
      await api.delegateSingleService(delegator.pid, delegator.pid, recipient.orgNo, service);
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.pid,
            recipient.orgNo,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.pid, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjeneste hos virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.name}) og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });
});

test.describe('Enkelttjenestedelegering fra org til person og org til org', () => {
  const api = new EnduserConnection();

  test.describe('Deleger enkelttjeneste fra org til person', () => {
    const delegator = { pid: '30818599567', orgNo: '313025853', name: 'LYDIG REDELIG TIGER AS' };
    const recipient = { pid: '17889574100', name: 'ANSVARSFULL REGLE' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.orgNo, recipient.pid);
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.orgNo,
          recipient.pid,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.orgNo, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste fra org til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Deleger enkelttjeneste fra org til org', () => {
    const delegator = {
      pid: '16928599063',
      orgNo: '312476932',
      name: 'FARLIG GJESTFRI TIGER AS',
    };
    const recipient = { orgNo: '313233383', name: 'RIK INNBRINGENDE TIGER AS' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.orgNo, recipient.orgNo);
    });

    test.afterEach(async () => {
      try {
        await api.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.orgNo,
          recipient.orgNo,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.orgNo, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste fra org til org', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Slett enkelttjenestedelegering fra org til person', () => {
    const delegator = {
      pid: '18846498989',
      orgNo: '311716670',
      name: 'NÆR REALISTISK TIGER AS',
    };
    const recipient = { pid: '09893049719', name: 'ANSTENDIG PURRE' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.orgNo, recipient.pid);
      await api.delegateSingleService(delegator.pid, delegator.orgNo, recipient.pid, service);
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.orgNo,
            recipient.pid,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.orgNo, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjenestedelegering fra org til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });

  test.describe('Slett enkelttjeneste fra org til org', () => {
    const delegator = {
      pid: '16815995930',
      orgNo: '313707679',
      name: 'INNESLUTTET MOTLØS SKILPADDE',
    };
    const recipient = { orgNo: '314021622', name: 'SKAMFULL KONKRET TIGER AS' };

    test.beforeEach(async () => {
      await api.addConnection(delegator.pid, delegator.orgNo, recipient.orgNo);
      await api.delegateSingleService(delegator.pid, delegator.orgNo, recipient.orgNo, service);
    });

    test.afterEach(async ({}, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.orgNo,
            recipient.orgNo,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.deleteConnection(delegator.pid, delegator.orgNo, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjeneste fra org til org', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });
});

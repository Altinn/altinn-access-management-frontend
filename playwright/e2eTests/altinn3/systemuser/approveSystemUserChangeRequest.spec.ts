import { test, expect } from 'playwright/fixture/pomFixture';
import { TestdataApi } from 'playwright/util/TestdataApi';
import { env } from 'playwright/util/helper';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TenorTestData, type TenorDagligLederMedOrg } from 'playwright/tenor/TenorTestData';
import { cleanupSystemUser } from 'playwright/util/systemUserCleanup';

// Leverandør + prebygd system er registrert infrastruktur (ikke Tenor). Kunde-
// virksomheten som forespørselen gjelder – og som logger inn/godkjenner – er Tenor.
const vendorOrgNumber = '310547891';
const prebuiltSystemId = '310547891_E2E-Playwright-Authentication';

const changeRequest = {
  requiredRights: [{ resource: [{ value: 'vegardtestressurs', id: 'urn:altinn:resource' }] }],
  unwantedRights: [{ resource: [{ value: 'authentication-e2e-test', id: 'urn:altinn:resource' }] }],
  requiredAccessPackages: [{ urn: 'urn:altinn:accesspackage:plansak' }],
  unwantedAccessPackages: [{ urn: 'urn:altinn:accesspackage:baerekraft' }],
};

test.describe('Systembruker endringsforespørsel', () => {
  const tenor = new TenorTestData();
  let api: ApiRequests;
  let owner: TenorDagligLederMedOrg;
  let systemUserId: string;
  let changeRequestResponse: Awaited<ReturnType<ApiRequests['postSystemuserChangeRequest']>>;

  test.beforeEach(async () => {
    api = new ApiRequests();
    owner = await tenor.dagligLederMedOrg();
    const externalRef = TestdataApi.generateExternalRef();

    const response = await api.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      prebuiltSystemId,
      owner.org.orgnr,
    );
    await api.approveSystemuserRequest(response.id, owner.org.orgnr, owner.dagligLeder.pid);

    systemUserId = await api.getSystemUserByQuery(
      vendorOrgNumber,
      prebuiltSystemId,
      owner.org.orgnr,
      externalRef,
    );

    changeRequestResponse = await api.postSystemuserChangeRequest(
      vendorOrgNumber,
      systemUserId,
      changeRequest,
    );
  });

  test('Avvis endringsforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to change request confirmation page and login', async () => {
      await page.goto(changeRequestResponse.confirmUrl);
      await login.loginNotChoosingActor(owner.dagligLeder.pid);
    });

    await test.step('Reject change request', async () => {
      await systemUserConfirmPage.reject();
    });

    await test.step('Verify rejection status', async () => {
      await expect(login.loginButton).toBeVisible();

      const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
        vendorOrgNumber,
        changeRequestResponse.id,
      );

      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn endringsforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to change request confirmation page and login', async () => {
      await page.goto(changeRequestResponse.confirmUrl);
      await login.loginNotChoosingActor(owner.dagligLeder.pid);
    });

    await test.step('Approve change request', async () => {
      await systemUserConfirmPage.approve();
    });

    await test.step('Verify acceptance status', async () => {
      await expect(login.loginButton).toBeVisible();

      //Read from status api to verify that status is Accepted after clicking "Approve"
      const statusApiRequest = await api.getStatusForSystemUserChangeRequest<{ status: string }>(
        vendorOrgNumber,
        changeRequestResponse.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });

    await test.step('Verify rights changes are reflected', async () => {
      await login.LoginToAccessManagement(owner.dagligLeder.pid);
      await login.selectMainUnitBySearching(owner.org.navn);

      const systemUserUrl = `${env('SYSTEMUSER_URL')}`;
      await page.goto(systemUserUrl + '/' + systemUserId);

      // Added by change request
      await expect(page.getByText('vegardendetilende')).toBeVisible();
      await expect(page.getByText('Plansak')).toBeVisible();

      // Removed by change request
      await expect(page.getByText('authentication-e2e-test')).not.toBeVisible();
      await expect(page.getByText('Baerekraft')).not.toBeVisible();
    });
  });

  test.afterEach(async () => {
    await cleanupSystemUser({
      vendorOrgNumber,
      ownerOrg: owner.org.orgnr,
      ownerPid: owner.dagligLeder.pid,
      systemUserId,
    });
  });
});

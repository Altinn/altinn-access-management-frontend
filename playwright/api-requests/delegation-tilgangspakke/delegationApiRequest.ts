import { request, APIRequestContext } from '@playwright/test';
import { Token } from './../Token';
import { env } from 'playwright/util/helper';

export class DelegationApiRequest {
  private readonly platformUrl: string;
  tokenClass: any;

  constructor(
    private apiRequestContext: APIRequestContext,
    private tokenHelper: Token = new Token(env('ORG')),
  ) {
    this.platformUrl = process.env.PLATFORM_URL!;
    if (!this.platformUrl) throw new Error('PLATFORM_URL must be set in .env');
  }
  private async authHeaders(person: {
    PID?: string;
    UserId?: string;
    PartyId?: string;
    PartyUUID?: string;
  }): Promise<Record<string, string>> {
    const token = await this.tokenHelper.generateAltinnPersonalToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  //Add org as 'Rettighetshaver' for delegating access pacakage
  public async addOrgForDelegation(fromPerson: any, toPerson: any): Promise<void> {
    const params = new URLSearchParams({
      party: fromPerson.PartyUUID,
      from: fromPerson.PartyUUID,
      to: toPerson.PartyUUID,
    });

    const url = `${this.platformUrl}/v1/enduser/connections?${params.toString()}`;
    const headers = await this.authHeaders(toPerson);

    const response = await this.apiRequestContext.post(url, { headers });

    if (!response.ok()) {
      throw new Error(`Delegation creation failed: ${response.status()} ${await response.text()}`);
    }
  }

  //Delegate access pacakge to 'Rettighetshaver'
  public async delegateAccessPkg(fromPerson: any, toPerson: any, pkg: string): Promise<void> {
    const headers = await this.authHeaders(fromPerson);

    const packagesToDelegate: string[] =
      typeof pkg === 'string' && pkg.trim().length > 0
        ? [pkg.trim()]
        : Array.isArray(fromPerson?.Packages)
          ? fromPerson.Packages
          : [];

    if (packagesToDelegate.length === 0) {
      throw new Error(
        `No packages to delegate. Provide 'pkg' argument or ensure fromPerson.Packages is an array. PartyUUID=${fromPerson?.PartyUUID}`,
      );
    }

    for (const pkgName of packagesToDelegate) {
      const params = new URLSearchParams({
        party: fromPerson.PartyUUID,
        from: fromPerson.PartyUUID,
        to: toPerson.PartyUUID,
        package: pkgName,
      });

      const url = `${this.platformUrl}/v1/enduser/connections/accesspackages?${params.toString()}`;
      const response = await this.apiRequestContext.post(url, { headers });

      if (!response.ok()) {
        throw new Error(
          `Delegating package "${pkgName}" failed: ${response.status()} ${await response.text()}`,
        );
      }
    }
  }

  public async cleanupDelegations(fromOrg: any, toOrg: any, authPerson: any) {
    const tokenClass = new Token();
    const token = await tokenClass.getPersonalCleanupAltinnToken({
      PID: authPerson.PID,
      UserId: authPerson.UserId,
      PartyId: authPerson.PartyId,
      PartyUUID: authPerson.PartyUUID,
    });

    const params = new URLSearchParams({
      party: fromOrg.PartyUUID,
      from: fromOrg.PartyUUID,
      to: toOrg.PartyUUID,
      cascade: 'true',
    });

    const url = `${this.platformUrl}/v1/enduser/connections?${params.toString()}`;

    const response = await this.apiRequestContext.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30_000,
    });

    if (response.status() !== 204) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `Delegation cleanup failed: status=${response.status()} url=${url} body=${body}`,
      );
    }
  }
}

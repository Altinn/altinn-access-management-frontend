import { env } from 'playwright/util/helper';

import { Token } from './Token';

interface AuthorizedParty {
  subunits?: AuthorizedParty[];
}

export class AuthorizedParties {
  private readonly token = new Token();

  async antallAktoererForbruker(pid: string): Promise<number> {
    const token = await this.token.getPersonalTokenByPid(pid);
    const response = await fetch(
      `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/authorizedparties?includeSubParties=true&includeInactiveParties=true`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch authorized parties. Status: ${response.status}`);
    }

    const { data }: { data: AuthorizedParty[] } = await response.json();
    // Same count as useAccountSelector: each party and its immediate subunits.
    return data.reduce((count, party) => count + 1 + (party.subunits?.length ?? 0), 0);
  }
}

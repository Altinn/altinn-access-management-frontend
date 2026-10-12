import { AltinnApi } from './AltinnApi';
import { platformUrl } from './apiRequest';

interface AuthorizedParty {
  subunits?: AuthorizedParty[];
}

export class AuthorizedParties extends AltinnApi {
  async antallAktoererForbruker(pid: string): Promise<number> {
    const { data } = await this.asUser<{ data: AuthorizedParty[] }>(
      pid,
      'GET',
      platformUrl('accessmanagement/api/v1/enduser/authorizedparties', {
        includeSubParties: true,
        includeInactiveParties: true,
      }),
    );
    // Same count as useAccountSelector: each party and its immediate subunits.
    return data.reduce((count, party) => count + 1 + (party.subunits?.length ?? 0), 0);
  }
}

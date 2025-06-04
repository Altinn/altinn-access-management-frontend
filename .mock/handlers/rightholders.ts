import { http, HttpResponse } from 'msw';

export const rightholdersHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/rightholders?:party&:from&:to`, () => {
    return HttpResponse.json([
      {
        partyUuid: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        partyType: 'Person',
        name: 'SITRONGUL MEDALJONG',
        registryRoles: null,
        roles: ['Maskinporten administrator', 'Tilgangsstyrer'],
        organizationNumber: null,
        unitType: null,
        inheritingUsers: [],
      },
    ]);
  }),
];

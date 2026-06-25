import { http, HttpResponse } from 'msw';

export const singlerightHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/singleright/delegation/resources`, () => {
    // BFF returns a list of delegated resources with permissions. Keep shape aligned.
    return HttpResponse.json([
      {
        resource: {
          identifier: 'appid-502',
          title: 'Det magiske klesskapet - lenketjeneste',
          description: 'Det magiske klesskapet',
          rightDescription: 'Gir tilgang til Narnia.',
          resourceOwnerName: 'NARNIA',
          resourceOwnerLogoUrl: 'https://altinncdn.no/orgs/digdir/digdir.png',
          resourceOwnerOrgNumber: '777777777',
          resourceOwnerOrgcode: 'digdir',
          resourceReferences: [],
          authorizationReference: [
            {
              id: 'urn:altinn:resource',
              value: 'appid-502',
            },
          ],
          resourceType: 'Default',
          delegable: true,
        },
        permissions: [
          {
            from: {
              id: '123',
              name: 'DISKRET NÆR TIGER AS',
              type: 'Organisasjon',
              variant: 'AS',
              parent: null,
              children: null,
              partyId: 51329012,
            },
            to: {
              id: '456',
              name: 'SITRONGUL MEDALJONG',
              type: 'Person',
              variant: 'Person',
              parent: null,
              children: null,
              partyId: 50789533,
            },
            via: null,
            role: null,
            viaRole: null,
          },
        ],
      },
    ]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/singleright/:id/rightholder/:id`, () => {
    return HttpResponse.json([]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/singleright/:id/rightholder`, () => {
    return HttpResponse.json([]);
  }),
  http.get(
    `${ACCESSMANAGEMENT_BASE_URL}/singleright/:partyuuid/delegationcheck/:resourceid`,
    ({ params }) => {
      const { resourceid } = params;
      return HttpResponse.json([
        {
          rightKey: resourceid + '/read',
          action: 'read',
          status: 'Delegable',
          reasonCodes: ['DelegationAccess'],
        },
        {
          rightKey: resourceid + '/write',
          action: 'write',
          status: 'Delegable',
          reasonCodes: ['DelegationAccess'],
        },
      ]);
    },
  ),
];

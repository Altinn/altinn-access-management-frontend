import { http, HttpResponse } from 'msw';

export const apiDelegationHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(ACCESSMANAGEMENT_BASE_URL + '/apidelegation/:id/:type', () => {
    return HttpResponse.json([
      {
        id: 'LIVLIG DYREBAR TIGER AS',
        name: 'LIVLIG DYREBAR TIGER AS',
        orgNumber: '313357120',
        apiList: [],
      },
      {
        id: 'MAGISK FANTASTISK KATT AS',
        name: 'MAGISK FANTASTISK KATT AS',
        orgNumber: '123456789',
        apiList: [],
      },
      {
        id: 'EVENTYR SKOGEN AS',
        name: 'EVENTYR SKOGEN AS',
        orgNumber: '987654321',
        apiList: [],
      },
      {
        id: 'STORSLATT HAV AS',
        name: 'STORSLATT HAV AS',
        orgNumber: '112233445',
        apiList: [],
      },
    ]);
  }),
  http.post(`${ACCESSMANAGEMENT_BASE_URL}/apidelegation/:id/received/revoke/batch`, () => {
    return HttpResponse.json([
      {
        orgNumber: '313357120',
        apiId: 'digdir-maskinportenschemaid-302',
        success: true,
      },
      {
        orgNumber: '313357120',
        apiId: 'digdir-maskinportenschemaid-302',
        success: false,
      },
    ]);
  }),
  http.post(ACCESSMANAGEMENT_BASE_URL + '/apidelegation/:id/offered/revoke/batch', () => {
    return HttpResponse.json([
      {
        orgNumber: '313357120',
        apiId: 'digdir-maskinportenschemaid-302',
        success: true,
      },
      {
        orgNumber: '313357120',
        apiId: 'digdir-maskinportenschemaid-302',
        success: false,
      },
    ]);
  }),
  http.post(`${ACCESSMANAGEMENT_BASE_URL}/apidelegation/:id/delegationcheck`, ({ params }) => {
    return HttpResponse.json([
      {
        rightKey: 'appid-136:ScopeAccess',
        resource: [
          {
            id: 'urn:altinn:resource',
            value: 'appid-136',
          },
        ],
        action: 'ScopeAccess',
        status: 'NotDelegable',
        details: [
          {
            code: 'MissingRoleAccess',
            description:
              'The user does not have any required role(s) for the reportee party. (urn:altinn:rolecode:HADM, urn:altinn:location:garage), would give access to delegate the service.',
            parameters: {
              roleRequirementsMatches: [
                {
                  id: 'urn:altinn:role',
                  value: 'DAGL',
                },
              ],
            },
          },
        ],
      },
    ]);
  }),
];

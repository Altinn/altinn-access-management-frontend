import { http, passthrough, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:6006';

export const handlers = [
  http.get(BASE_URL + '/accessmanagement/api/v1/resources/search', () => {
    return HttpResponse.json({
      page: 1,
      numEntriesTotal: 2,
      pageList: [
        {
          identifier: 'appid-502',
          title: 'Det magiske klesskapet - lenketjeneste',
          description: 'Det magiske klesskapet',
          rightDescription: 'Gir tilgang til Narnia.',
          homepage: null,
          status: null,
          spatial: null,
          contactPoints: [
            {
              category: 'Some category',
              email: 'email@someemaildigdir.no',
              telephone: '12345678',
              contactPage: 'Some page (webpage maybe?)',
            },
          ],
          delegable: true,
          visible: true,
          resourceOwnerName: 'NARNIA',
          resourceOwnerOrgNumber: '777777777',
          resourceReferences: [],
          priorityCounter: 2,
          resourceType: 'Default',
          authorizationReference: [
            {
              id: 'urn:altinn:resource',
              value: 'appid-502',
            },
          ],
          keywords: ['klesskapet_kw'],
        },
        {
          identifier: 'appid-503',
          title: 'Snarveien - lenketjeneste',
          description: 'Snarveien som lenketjeneste',
          rightDescription: 'Gir tilgang til snarveier.',
          homepage: null,
          status: null,
          spatial: null,
          contactPoints: [
            {
              category: 'Some category',
              email: 'email@someemaildigdir.no',
              telephone: '12345678',
              contactPage: 'Some page (webpage maybe?)',
            },
          ],
          delegable: true,
        },
      ],
    });
  }),
  http.get(BASE_URL + '/accessmanagement/api/v1/resources/resourceowners', () => {
    return HttpResponse.json([
      {
        organisationName: 'NARNIA',
        organisationNumber: '889640782',
      },
    ]);
  }),
  http.get(BASE_URL + '/accessmanagement/api/v1/apidelegation/:id/offered', () => {
    return HttpResponse.json([
      {
        id: 'LIVLIG DYREBAR TIGER AS',
        name: 'LIVLIG DYREBAR TIGER AS',
        orgNumber: '313357120',
        apiList: [
          {
            id: 'digdir-maskinportenschemaid-302',
            apiName: 'Automation Regression',
            owner: 'Digitaliseringsdirektoratet',
            description:
              'Gir anledning til a teste maskinporten som en del av automatiserte tester_Endret',
            scopes: [],
          },
        ],
      },
    ]);
  }),
  http.get(BASE_URL + '/accessmanagement/api/v1/apidelegation/:id/received', () => {
    return HttpResponse.json([
      {
        id: 'LIVLIG DYREBAR TIGER AS',
        name: 'LIVLIG DYREBAR TIGER AS',
        orgNumber: '313357120',
        apiList: [
          {
            id: 'digdir-maskinportenschemaid-302',
            apiName: 'Automation Regression',
            owner: 'Digitaliseringsdirektoratet',
            description:
              'Gir anledning til a teste maskinporten som en del av automatiserte tester_Endret',
            scopes: [],
          },
          {
            id: 'digdir-maskinportenschemaid-302',
            apiName: 'Automation Regression 2 ',
            owner: 'Digitaliseringsdirektoratet',
            description:
              'Gir anledning til a teste maskinporten som en del av automatiserte tester_Endret',
            scopes: [],
          },
        ],
      },
    ]);
  }),
  http.post(BASE_URL + '/accessmanagement/api/v1/apidelegation/:id/received/revoke/batch', () => {
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
  http.post(BASE_URL + '/accessmanagement/api/v1/apidelegation/:id/offered/revoke/batch', () => {
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
  http.post(
    `${BASE_URL}/accessmanagement/api/v1/apidelegation/:id/delegationcheck`,
    ({ params }) => {
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
    },
  ),
  http.get('*', () => {
    return passthrough();
  }),
];

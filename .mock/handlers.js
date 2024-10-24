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
          resourceReferences: [
            {
              ReferenceSource: 'Altinn3',
              Reference: 'ttd/a3-app',
              ReferenceType: 'ApplicationId',
            },
          ],
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
        {
          identifier: 'missing_role_access',
          title: 'Krever Rolle',
          description: 'Denne ressursen krever spesifikke roller for tilgang.',
          rightDescription: 'Denne ressursen krever spesifikke roller for tilgang.',
          delegable: true,
          resourceOwnerName: 'Myndighet for Manglende Rolle',
          authorizationReference: [
            {
              id: 'urn:altinn:resource',
              value: 'missing_role_access',
            },
          ],
        },
        {
          identifier: 'missing_right_access',
          title: 'Krever Rettighet',
          description: 'Denne ressursen krever spesifikke rettigheter for tilgang.',
          rightDescription: 'Denne ressursen krever spesifikke rettigheter for tilgang.',
          delegable: true,
          resourceOwnerName: 'Myndighet for Manglende Rettigheter',
          authorizationReference: [
            {
              id: 'urn:altinn:resource',
              value: 'missing_right_access',
            },
          ],
        },
        {
          identifier: 'missing_srr_rightAccess',
          title: 'Krever SRR Tilgang',
          description: 'Denne ressursen krever SRR rettigheter for tilgang.',
          rightDescription: 'Denne ressursen krever SRR rettigheter for tilgang.',
          delegable: true,
          resourceOwnerName: 'Myndighet for Manglende SRR Rettigheter',
          authorizationReference: [
            {
              id: 'urn:altinn:resource',
              value: 'missing_srr_rightAccess',
            },
          ],
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
  http.get(BASE_URL + '/accessmanagement/api/v1/apidelegation/:id/received', () => {
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
  http.post(
    `${BASE_URL}/accessmanagement/api/v1/singleright/checkdelegationaccesses/:id`,
    async (req, res, ctx) => {
      const requestBody = await req.request.json();
      const val = requestBody?.resource?.[0]?.value;
      if (val === 'missing_role_access') {
        return HttpResponse.json([
          {
            rightKey: 'a3-app/read',
            resource: [
              {
                id: 'urn:altinn:app',
                value: 'a3-app',
              },
              {
                id: 'urn:altinn:org',
                value: 'ttd',
              },
            ],
            action: 'read',
            status: 'Delegable',
            details: [
              {
                code: 'RoleAccess',
                description:
                  'Delegator have access through having one of the following role(s) for the reportee party: urn:altinn:rolecode:dagl. Note: if the user is a Main Administrator (HADM) the user might not have direct access to the role other than for delegation purposes.',
                parameters: {
                  RoleRequirementsMatches: [
                    {
                      id: 'urn:altinn:rolecode',
                      value: 'dagl',
                    },
                  ],
                },
              },
            ],
          },
          {
            rightKey: 'a3-app/write',
            resource: [
              {
                id: 'urn:altinn:app',
                value: 'a3-app',
              },
              {
                id: 'urn:altinn:org',
                value: 'ttd',
              },
            ],
            action: 'write',
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
          {
            rightKey: 'a3-app/sign',
            resource: [
              {
                id: 'urn:altinn:app',
                value: 'a3-app',
              },
              {
                id: 'urn:altinn:org',
                value: 'ttd',
              },
            ],
            action: 'sign',
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
      }
      if (val === 'missing_srr_rightAccess') {
        return HttpResponse.json([
          {
            rightKey: 'appid-510/read',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-510',
              },
            ],
            action: 'read',
            status: 'Delegable',
            details: [
              {
                code: 'RoleAccess',
                description:
                  'Delegator have access through having one of the following role(s) for the reportee party: urn:altinn:rolecode:dagl. Note: if the user is a Main Administrator (HADM) the user might not have direct access to the role other than for delegation purposes.',
                parameters: {
                  RoleRequirementsMatches: [
                    {
                      id: 'urn:altinn:rolecode',
                      value: 'dagl',
                    },
                  ],
                },
              },
            ],
          },
          {
            rightKey: 'appid-510/write',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-510',
              },
            ],
            action: 'write',
            status: 'NotDelegable',
            details: [
              {
                code: 'MissingSrrRightAccess',
                description:
                  'The user have access through delegation(s) of the right to the recipient(s)',
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
          {
            rightKey: 'appid-510/sign',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-510',
              },
            ],
            action: 'sign',
            status: 'NotDelegable',
            details: [
              {
                code: 'MissingSrrRightAccess',
                description:
                  'The user have access through delegation(s) of the right to the recipient(s)',
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
      }
      if (val === 'missing_right_access') {
        return HttpResponse.json([
          {
            rightKey: 'appid-510/read',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-510',
              },
            ],
            action: 'read',
            status: 'Delegable',
            details: [
              {
                code: 'RoleAccess',
                description: '',
                parameters: {},
              },
            ],
          },
          {
            rightKey: 'appid-510/write',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-510',
              },
            ],
            action: 'write',
            status: 'NotDelegable',
            details: [
              {
                code: 'MissingRightAccess',
                description: '',
                parameters: {},
              },
            ],
          },
          {
            rightKey: 'appid-510/sign',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-510',
              },
            ],
            action: 'sign',
            status: 'NotDelegable',
            details: [
              {
                code: 'MissingRightAccess',
                description: '',
                parameters: {},
              },
            ],
          },
        ]);
      }
      return HttpResponse.json([
        {
          rightKey: 'test_resource_local:read',
          resource: [
            {
              id: 'urn:altinn:resource',
              value: 'test_resource_local',
            },
          ],
          action: 'read',
          status: 'Delegable',
          details: [
            {
              code: 'RoleAccess',
              description:
                'Delegator have access through having one of the following role(s) for the reportee party: urn:altinn:rolecode:dagl. Note: if the user is a Main Administrator (HADM) the user might not have direct access to the role other than for delegation purposes.',
              parameters: {
                RoleRequirementsMatches: [
                  {
                    id: 'urn:altinn:rolecode',
                    value: 'dagl',
                  },
                ],
              },
            },
          ],
        },
      ]);
    },
  ),
  http.get(`${BASE_URL}/accessmanagement/api/v1/lookup/org/:id`, () => {
    return HttpResponse.json({
      orgNumber: '991825827',
      name: 'Digitaliseringsdirektoratet',
    });
  }),
  http.get(`${BASE_URL}/accessmanagement/api/v1/user/reporteelist/:id`, () => {
    return HttpResponse.json({
      partyUuid: '54f128f7-ca7c-4a57-ad49-3787eb79b506',
      name: 'DISKRET NÆR TIGER AS',
      organizationNumber: '310202398',
      subunits: [
        {
          partyUuid: '0020c970-ba68-44cd-8440-0894b594f58a',
          name: 'DISKRET NÆR TIGER AS',
          organizationNumber: '311312294',
          subunits: [],
        },
      ],
    });
  }),
  http.get(`${BASE_URL}/accessmanagement/api/v1/user/profile`, () => {
    return HttpResponse.json({
      userId: 20010996,
      userUuid: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
      userName: 'GullMedalje',
      partyId: 50789533,
      party: {
        partyId: 50789533,
        partyUuid: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        name: 'SITRONGUL MEDALJONG',
      },
      userType: 1,
      profileSettingPreference: {
        language: 'nb',
        preSelectedPartyId: 0,
        doNotPromptForParty: false,
      },
    });
  }),
  http.get('*', () => {
    return passthrough();
  }),
];

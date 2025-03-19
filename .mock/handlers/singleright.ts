import { http, HttpResponse } from 'msw';

export const singlerightHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/singleright/:id/rightholder/:id`, () => {
    return HttpResponse.json([]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/singleright/:id/rightholder`, () => {
    return HttpResponse.json([]);
  }),
  http.post(`${ACCESSMANAGEMENT_BASE_URL}/singleright/delegate/:id`, async (req: any) => {
    const requestBody = await req.request.json();
    const rights = requestBody?.Rights;
    const val = rights?.[0]?.Resource?.[0]?.value;
    if (val === 'delegation_error') {
      return HttpResponse.json(
        {
          detail: 'Delegation failed',
        },
        { status: 400 },
      );
    }
    if (val === 'partial_delegation_error') {
      return HttpResponse.json(
        {
          from: [
            {
              id: 'urn:altinn:organizationnumber',
              value: '991825827',
            },
          ],
          to: [
            {
              id: 'urn:altinn:ssn',
              value: '50019992',
            },
          ],
          rightDelegationResults: [
            {
              rightKey: 'partial_delegation_error/read',
              resource: [
                {
                  id: 'urn:altinn:resource',
                  value: 'appid-503',
                },
              ],
              action: 'read',
              status: 'Delegated',
              details: [
                {
                  code: '',
                  description: '',
                  parameters: {
                    roleRequirementsMatches: [
                      {
                        id: '',
                        value: '',
                      },
                    ],
                  },
                },
              ],
            },
            {
              rightKey: 'partial_delegation_error/write',
              resource: [
                {
                  id: 'urn:altinn:resource',
                  value: 'appid-503',
                },
              ],
              action: 'read',
              status: 'NotDelegated',
              details: [
                {
                  code: '',
                  description: '',
                  parameters: {
                    roleRequirementsMatches: [
                      {
                        id: '',
                        value: '',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
        { status: 200 },
      );
    }
    return HttpResponse.json(
      {
        from: [
          {
            id: 'urn:altinn:organizationnumber',
            value: '991825827',
          },
        ],
        to: [
          {
            id: 'urn:altinn:ssn',
            value: '50019992',
          },
        ],
        rightDelegationResults: [
          {
            rightKey: 'ttd-somereasourceid/read',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'appid-503',
              },
            ],
            action: 'read',
            status: 'Delegated',
            details: [
              {
                code: '',
                description: '',
                parameters: {
                  roleRequirementsMatches: [
                    {
                      id: '',
                      value: '',
                    },
                  ],
                },
              },
            ],
          },
          {
            rightKey: 'ttd-somereasourceid/sign',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'ttd-somereasourceid',
              },
            ],
            action: 'sign',
            status: 'Delegated',
            details: [
              {
                code: 'error',
                description: 'Delegation failed',
                parameters: {
                  roleRequirementsMatches: [
                    {
                      id: '',
                      value: '',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      { status: 200 },
    );
  }),
  http.post(
    `${ACCESSMANAGEMENT_BASE_URL}/singleright/checkdelegationaccesses/:id`,
    async (req: any) => {
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
      if (val === 'delegation_error') {
        return HttpResponse.json([
          {
            rightKey: 'delegation_error/read',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'delegation_error',
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
            rightKey: 'delegation_error/write',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'delegation_error',
              },
            ],
            action: 'write',
            status: 'Delegable',
            details: [
              {
                code: 'RoleAccess',
                description: '',
                parameters: {},
              },
            ],
          },
        ]);
      }
      if (val === 'partial_delegation_error') {
        return HttpResponse.json([
          {
            rightKey: 'partial_delegation_error/read',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'partial_delegation_error',
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
            rightKey: 'partial_delegation_error/write',
            resource: [
              {
                id: 'urn:altinn:resource',
                value: 'partial_delegation_error',
              },
            ],
            action: 'write',
            status: 'Delegable',
            details: [
              {
                code: 'RoleAccess',
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

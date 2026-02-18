import { http, HttpResponse } from 'msw';

type MockRole = {
  id: string;
  code: string;
};

type MockConnectionParty = {
  id: string;
  name: string;
  type: 'Person' | 'Organisasjon';
  variant: string;
  children: null;
  partyId: number;
  organizationIdentifier?: string;
  dateOfBirth?: string;
  isDeleted: boolean;
};

type MockConnection = {
  party: MockConnectionParty;
  roles: MockRole[];
  connections: [];
  sortKey: string;
};

const roleDagligLeder: MockRole = { id: '123', code: 'daglig-leder' };
const roleRettighetshaver: MockRole = { id: '456', code: 'rettighetshaver' };
const roleAgent: MockRole = { id: '789', code: 'agent' };

const getStablePartyId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 10000000;
};

const createOrgConnection = (id: string, name: string, roles: MockRole[]): MockConnection => ({
  party: {
    id,
    name,
    type: 'Organisasjon',
    variant: 'AS',
    children: null,
    partyId: getStablePartyId(id),
    organizationIdentifier: '310202398',
    isDeleted: false,
  },
  roles,
  connections: [],
  sortKey: name.toLowerCase(),
});

const createPersonConnection = (id: string, name: string, roles: MockRole[]): MockConnection => ({
  party: {
    id,
    name,
    type: 'Person',
    variant: 'Person',
    children: null,
    partyId: getStablePartyId(id),
    dateOfBirth: '1984-04-03',
    isDeleted: false,
  },
  roles,
  connections: [],
  sortKey: name.toLowerCase(),
});

const getRightHoldersResponse = (requestUrl: URL): MockConnection[] => {
  const partyId = requestUrl.searchParams.get('party') ?? '';
  const fromId = requestUrl.searchParams.get('from') ?? '';
  const toId = requestUrl.searchParams.get('to') ?? '';
  const includeClientDelegations =
    requestUrl.searchParams.get('includeClientDelegations') !== 'false';
  const includeAgentConnections =
    requestUrl.searchParams.get('includeAgentConnections') !== 'false';

  if (fromId.includes('PARTIALLY_DELETABLE') || toId.includes('PARTIALLY_DELETABLE')) {
    const targetId = fromId || toId || partyId || 'partially-deletable';
    return [
      createOrgConnection(targetId, 'DIGITALISERINGSDIREKTORATET', [
        roleDagligLeder,
        roleRettighetshaver,
      ]),
    ];
  }

  if (fromId.includes('NOT_DELETABLE') || toId.includes('NOT_DELETABLE')) {
    const targetId = fromId || toId || partyId || 'not-deletable';
    return [createOrgConnection(targetId, 'DIGITALISERINGSDIREKTORATET', [roleDagligLeder])];
  }

  if (fromId && toId) {
    const connectedPartyId = fromId === partyId ? toId : fromId;
    const isConnectedPartyPerson = connectedPartyId.toLowerCase() === 'user';

    return isConnectedPartyPerson
      ? [createPersonConnection(connectedPartyId, 'SITRONGUL MEDALJONG', [roleRettighetshaver])]
      : [
          createOrgConnection(connectedPartyId, 'DIGITALISERINGSDIREKTORATET', [
            roleRettighetshaver,
          ]),
        ];
  }

  if (fromId && !toId) {
    const rightHolders: MockConnection[] = [
      createPersonConnection('person-right-holder-1', 'SITRONGUL MEDALJONG', [roleRettighetshaver]),
      createOrgConnection('org-right-holder-1', 'EKSEMPEL REGNSKAP AS', [roleDagligLeder]),
    ];

    if (includeAgentConnections) {
      rightHolders.push(createPersonConnection('person-agent-1', 'OLA AGENT', [roleAgent]));
    }

    return rightHolders;
  }

  if (!fromId && toId) {
    const reportees: MockConnection[] = [
      createOrgConnection('reportee-org-1', 'DISKRET NÆR TIGER AS', [roleRettighetshaver]),
      createPersonConnection('reportee-person-1', 'KARI FULLMAKT', [roleRettighetshaver]),
    ];

    if (includeClientDelegations) {
      reportees.push(
        createOrgConnection('reportee-client-1', 'KLIENT FULLMAKT AS', [roleRettighetshaver]),
      );
    }

    return reportees;
  }

  return [
    createOrgConnection(
      partyId || '3d8b34c3-df0d-4dcc-be12-e788ce414744',
      'DIGITALISERINGSDIREKTORATET',
      [roleRettighetshaver],
    ),
  ];
};

export const userHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/reporteelist/:id`, () => {
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
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/rightholders`, ({ request }) => {
    return HttpResponse.json(getRightHoldersResponse(new URL(request.url)));
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/connection/rightholders`, ({ request }) => {
    return HttpResponse.json(getRightHoldersResponse(new URL(request.url)));
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/profile`, () => {
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
  http.post(
    new RegExp(`${ACCESSMANAGEMENT_BASE_URL}/user/reportee/(?:/[^/]+)?/rightholder/person`),
    async (req: any) => {
      const requestBody = await req.request.json();
      const ssn = requestBody?.ssn;
      const lastName = requestBody?.lastName;
      if (lastName.length < 4 || ssn.length !== 11) {
        return HttpResponse.json({ error: 'Invalid input' }, { status: 404 });
      } else {
        return HttpResponse.json({
          partyUuid: '54f128f7-ca7c-4a57-ad49-3787eb79b506',
        });
      }
    },
  ),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/reportee/:id`, () => {
    return HttpResponse.json({
      partyUuid: '2a2f6ea4-ae81-4098-8e14-a68dec6f9aac',
      name: 'LEVENDE KUNSTIG APE',
      organizationNumber: '312787075',
      partyId: 51506003,
      type: 'Organization',
      unitType: 'FLI',
      isDeleted: false,
      onlyHierarchyElementWithNoAccess: false,
      authorizedResources: [],
      authorizedRoles: [
        'LEDE',
        'LOPER',
        'ADMAI',
        'REGNA',
        'SISKD',
        'UILUF',
        'UTINN',
        'UTOMR',
        'KLADM',
        'ATTST',
        'HVASK',
        'PAVAD',
        'SIGNE',
        'UIHTL',
        'KOMAB',
        'HADM',
        'PASIG',
        'A0278',
        'A0236',
        'A0212',
        'APIADM',
        'A0298',
      ],
      subunits: [
        {
          partyUuid: 'fc2e9a43-c74b-42aa-9656-fbae2fabe950',
          name: 'LEVENDE KUNSTIG APE',
          organizationNumber: '311918265',
          partyId: 51505983,
          type: 'Organization',
          unitType: 'AAFY',
          isDeleted: false,
          onlyHierarchyElementWithNoAccess: false,
          authorizedResources: [],
          authorizedRoles: [
            'LEDE',
            'LOPER',
            'ADMAI',
            'REGNA',
            'SISKD',
            'UILUF',
            'UTINN',
            'UTOMR',
            'KLADM',
            'ATTST',
            'HVASK',
            'PAVAD',
            'SIGNE',
            'UIHTL',
            'KOMAB',
            'HADM',
            'PASIG',
            'A0278',
            'A0236',
            'A0212',
            'APIADM',
            'A0298',
          ],
          subunits: [],
        },
      ],
    });
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/actorlist/old`, () => {
    return HttpResponse.json([
      {
        partyUuid: '54f128f7-ca7c-4a57-ad49-3787eb79b506',
        name: 'DISKRET NÆR TIGER AS',
        organizationNumber: '310202398',
        dateOfBirth: null,
        partyId: 50365521,
        type: 'Organization',
        unitType: null,
        isDeleted: false,
        onlyHierarchyElementWithNoAccess: false,
        authorizedResources: [],
        authorizedRoles: [],
        subunits: [
          {
            partyUuid: '0020c970-ba68-44cd-8440-0894b594f58a',
            name: 'DISKRET NÆR TIGER AVDELING',
            organizationNumber: '311312294',
            dateOfBirth: null,
            partyId: 50365522,
            type: 'Organization',
            unitType: 'SubUnit',
            isDeleted: false,
            onlyHierarchyElementWithNoAccess: false,
            authorizedResources: [],
            authorizedRoles: [],
            subunits: [],
          },
        ],
      },
      {
        partyUuid: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        name: 'SITRONGUL MEDALJONG',
        organizationNumber: null,
        dateOfBirth: '1984-04-03',
        partyId: 50789533,
        type: 'Person',
        unitType: null,
        isDeleted: false,
        onlyHierarchyElementWithNoAccess: false,
        authorizedResources: [],
        authorizedRoles: [],
        subunits: [],
      },
    ]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/actorlist/favorites`, () => {
    return HttpResponse.json(['54f128f7-ca7c-4a57-ad49-3787eb79b506']);
  }),
  http.put(`${ACCESSMANAGEMENT_BASE_URL}/user/actorlist/favorites/:actorUuid`, () => {
    return HttpResponse.json(null, { status: 200 });
  }),
  http.delete(`${ACCESSMANAGEMENT_BASE_URL}/user/actorlist/favorites/:actorUuid`, () => {
    return HttpResponse.json(null, { status: 200 });
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/isClientAdmin`, () => {
    return HttpResponse.json(true);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/user/isAdmin`, () => {
    return HttpResponse.json(true);
  }),
];

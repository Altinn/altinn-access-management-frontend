import { http, HttpResponse } from 'msw';

type Entity = {
  id: string;
  name: string;
  type: string;
  variant: string;
};

const createEntity = (id: string, name: string, type = 'Organization', variant = 'AS'): Entity => ({
  id,
  name,
  type,
  variant,
});

const roleResponse = {
  role: {
    id: '9e5d3acf-cef7-4bbe-b101-8e9ab7b8b3e4',
    name: 'Styreleder',
    code: 'styreleder',
    description: 'Visning av hvordan rollen kan arves eller delegeres.',
    provider: {
      id: 'provider-ccr',
      name: 'Enhetsregisteret',
      code: 'sys-ccr',
    },
  },
};

const roleMetadataResponse = [
  {
    id: '123',
    name: 'Daglig leder',
    code: 'daglig-leder',
    description: 'Fysisk- eller juridisk person med ansvar for daglig drift.',
    isKeyRole: true,
    urn: 'urn:altinn:external-role:ccr:daglig-leder',
    legacyRoleCode: 'DAGL',
    legacyUrn: 'urn:altinn:rolecode:DAGL',
    provider: {
      id: 'provider-ccr',
      name: 'Enhetsregisteret',
      refId: null,
      logoUrl: null,
      code: 'sys-ccr',
      typeId: 'provider-type-ccr',
    },
  },
  {
    id: '456',
    name: 'Rettighetshaver',
    code: 'rettighetshaver',
    description: 'Representerer en delegert rettighetshaver.',
    isKeyRole: false,
    urn: 'urn:altinn:rolecode:rettighetshaver',
    legacyRoleCode: null,
    legacyUrn: null,
    provider: {
      id: 'provider-ccr',
      name: 'Enhetsregisteret',
      refId: null,
      logoUrl: null,
      code: 'sys-ccr',
      typeId: 'provider-type-ccr',
    },
  },
  {
    id: '789',
    name: 'Agent',
    code: 'agent',
    description: 'Representerer en agentforbindelse.',
    isKeyRole: false,
    urn: 'urn:altinn:rolecode:agent',
    legacyRoleCode: null,
    legacyUrn: null,
    provider: {
      id: 'provider-ccr',
      name: 'Enhetsregisteret',
      refId: null,
      logoUrl: null,
      code: 'sys-ccr',
      typeId: 'provider-type-ccr',
    },
  },
  {
    id: '9e5d3acf-cef7-4bbe-b101-8e9ab7b8b3e4',
    name: 'Styrets leder',
    code: 'styreleder',
    description: 'Fysisk- eller juridisk person som er styremedlem og leder et styre.',
    isKeyRole: true,
    urn: 'urn:altinn:external-role:ccr:styreleder',
    legacyRoleCode: 'LEDE',
    legacyUrn: 'urn:altinn:rolecode:LEDE',
    provider: {
      id: 'provider-ccr',
      name: 'Enhetsregisteret',
      refId: null,
      logoUrl: null,
      code: 'sys-ccr',
      typeId: 'provider-type-ccr',
    },
  },
];

const viaRole = (id: string, code: string) => ({
  id,
  code,
  children: [],
  roleCodes: [],
});

const scenarioMap: Record<string, any[]> = {
  'party-via-role-parent': [
    {
      from: createEntity('org-digdir', 'Digitaliseringsdirektoratet'),
      to: createEntity('party-via-role-parent', 'Aktiv Epoke AS'),
      via: createEntity('org-holding', 'Altinn Holding AS'),
      role: null,
      viaRole: viaRole('via-role-1', 'styreleder'),
    },
  ],
  'party-via-parent': [
    {
      from: createEntity('org-koncern', 'Nordic Holdings ASA'),
      to: createEntity('party-via-parent', 'Aktiv Epoke AS'),
      via: createEntity('org-koncern', 'Nordic Holdings ASA'),
      role: null,
      viaRole: null,
    },
  ],
  'party-via-role-employee': [
    {
      from: createEntity('org-aktiv-epoke', 'Aktiv Epoke AS'),
      to: createEntity('party-via-role-employee', 'Fiona Økonom', 'Person', 'Person'),
      via: createEntity('org-aktiv-epoke', 'Aktiv Epoke AS'),
      role: null,
      viaRole: viaRole('via-role-2', 'regnskapsforer'),
    },
  ],
  'party-via-agent': [
    {
      from: createEntity('org-aktiv-epoke', 'Aktiv Epoke AS'),
      to: createEntity('party-via-agent', 'Ola Agent', 'Person', 'Person'),
      via: createEntity('org-agent', 'Tall og Regnskap AS'),
      role: null,
      viaRole: null,
    },
  ],
};

export const roleHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/role/meta`, () => {
    return HttpResponse.json(roleMetadataResponse);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/role/permissions`, ({ request }) => {
    const url = new URL(request.url);
    const toParam = url.searchParams.get('to') ?? '';
    const permissions = scenarioMap[toParam] ?? [];

    if (!permissions.length) {
      return HttpResponse.json([]);
    }

    return HttpResponse.json([
      {
        ...roleResponse,
        permissions,
      },
    ]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/role/resources`, () => {
    return HttpResponse.json([
      {
        id: 'resource-1',
        providerId: 'provider-ccr',
        typeId: 'role-resource',
        name: 'Registrering av styre',
        description: 'Eksempletjeneste knyttet til rollen.',
        refId: 'resource-1',
      },
    ]);
  }),
];

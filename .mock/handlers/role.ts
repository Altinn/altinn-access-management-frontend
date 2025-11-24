import { http, HttpResponse } from 'msw';

type Entity = {
  id: string;
  name: string;
  type: string;
  variant: string;
  keyValues: null;
};

const createEntity = (id: string, name: string, type = 'Organization', variant = 'AS'): Entity => ({
  id,
  name,
  type,
  variant,
  keyValues: null,
});

const roleResponse = {
  role: {
    id: 'role-ccr-styreleder',
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

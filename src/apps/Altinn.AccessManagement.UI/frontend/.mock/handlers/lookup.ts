import { http, HttpResponse } from 'msw';

import orgData from './data/orgData.json';

const diskretNaerTiger = {
  id: 'cd35779b-b174-4ecc-bbef-ece13611be7f',
  partyId: 51329012,
  name: 'DISKRET NÆR TIGER AS',
  type: 'Organization',
  unitType: 'AS',
  organizationIdentifier: '310202398',
  dateOfBirth: null,
  isDeleted: false,
  children: null,
  parent: null,
};

export const lookupHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/lookup/org/:id`, () => {
    return HttpResponse.json({
      id: '3d8b34c3-df0d-4dcc-be12-e788ce414744',
      partyId: 50088610,
      name: 'Digitaliseringsdirektoratet',
      type: 'Organization',
      unitType: 'ORGL',
      organizationIdentifier: '991825827',
      dateOfBirth: null,
      isDeleted: false,
      children: null,
      parent: null,
    });
  }),
  // Also answers lookup/party/user
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/lookup/party/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ ...diskretNaerTiger, id });
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/lookup/party`, () => {
    return HttpResponse.json(diskretNaerTiger);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/cdn/orgdata`, () => {
    return HttpResponse.json(orgData);
  }),
];

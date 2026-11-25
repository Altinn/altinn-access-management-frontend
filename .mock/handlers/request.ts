import { http, HttpResponse } from 'msw';

export const requestHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/request/received/count/subunits`, () => {
    return HttpResponse.json([
      {
        party: {
          id: '0195efb8-7c80-7cb0-a2b6-8f5c1e4b2a11',
          name: 'LEVENDE KUNSTIG APE AVD OSLO',
          type: 'Organization',
          unitType: 'BEDR',
          organizationIdentifier: '910000001',
          isDeleted: false,
        },
        count: 3,
      },
      {
        party: {
          id: '0195efb8-7c80-7cb0-a2b6-8f5c1e4b2a12',
          name: 'LEVENDE KUNSTIG APE AVD BERGEN',
          type: 'Organization',
          unitType: 'BEDR',
          organizationIdentifier: '910000002',
          isDeleted: false,
        },
        count: 1,
      },
      {
        party: {
          id: '0195efb8-7c80-7cb0-a2b6-8f5c1e4b2a13',
          name: 'LEVENDE KUNSTIG APE AVD TROMSØ',
          type: 'Organization',
          unitType: 'BEDR',
          organizationIdentifier: '910000003',
          isDeleted: false,
        },
        count: 0,
      },
    ]);
  }),
];

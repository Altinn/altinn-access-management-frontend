import { http, HttpResponse } from 'msw';
import packages from './data/packages.json';

export const accessPackageHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/role/assignments/:ownerId/:holderId`, () => {
    HttpResponse.json([
      {
        id: '461b0ec2-6795-4055-9306-2acefd7c6a31  ',
        roleId: 'de42ae15-c265-42b3-8060-64c779684902',
        fromId: 'cd35779b-b174-4ecc-bbef-ece13611be7f',
        toId: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        role: {
          id: 'de42ae15-c265-42b3-8060-64c779684902',
          name: 'Styremedlem',
          code: 'MEDL',
          description: 'Fysisk- eller juridisk person som inngår i et styre',
        },
      },
      {
        id: '43f42152-8900-4fcf-ac70-62d2d566581c',
        roleId: 'de42ae15-c265-42b3-8060-64c779684902',
        fromId: 'cd35779b-b174-4ecc-bbef-ece13611be7f',
        toId: '167536b5-f8ed-4c5a-8f48-0279507e53ae',
        role: {
          id: '72c336a2-1705-4aef-b220-7f4aa6c0e69d',
          name: 'Styrets leder',
          code: 'LEDE',
          description: 'Fysisk- eller juridisk person som er styremedlem og leder et styre',
        },
      },
    ]);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/:search`, ({ params }) => {
    const { search } = params;
    if (search === 'error') {
      return HttpResponse.error();
    }
    return HttpResponse.json(packages);
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/delegations/:from/:to`, ({ params }) => {
    const { from, to } = params;
    return HttpResponse.json({
      'fc93d25e-80bc-469a-aa43-a6cee80eb3e2': [
        {
          accessPackageId: '7b8a3aaa-c8ed-4ac4-923a-335f4f9eb45a',
          delegationDetails: {
            delegatedFrom: from,
            delegatedTo: to,
            lastChangedOn: '2024-11-22T14:57:39.2568955+01:00',
          },
          inherited: false,
          inheritedFrom: null,
        },
        {
          accessPackageId: 'c5bbbc3f-605a-4dcb-a587-32124d7bb76d',
          delegationDetails: {
            delegatedFrom: from,
            delegatedTo: to,
            lastChangedOn: '2024-10-22T15:57:39.2568955+02:00',
          },
          inherited: false,
        },
      ],
      'a8834a7c-ed89-4c73-b5d5-19a2347f3b13': [
        {
          accessPackageId: 'bacc9294-56fd-457f-930e-59ee4a7a3894',
          delegationDetails: {
            delegatedFrom: from,
            delegatedTo: to,
            lastChangedOn: '2024-10-22T15:57:39.2568955+02:00',
          },
          inherited: false,
          inheritedFrom: null,
        },
      ],
      '6F938DE8-34F2-4BAB-A0C6-3A3EB64AAD3B': [
        {
          accessPackageId: '91cf61ae-69ab-49d5-b51a-80591c91f255',
          delegationDetails: {
            delegatedFrom: from,
            delegatedTo: to,
            lastChangedOn: '2024-10-22T15:57:39.2568955+02:00',
          },
          inherited: false,
        },
      ],
    });
  }),
];

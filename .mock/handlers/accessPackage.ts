import { http, HttpResponse } from 'msw';
import packages from './data/packages.json';
import delegations from './data/delegations.json';

export const accessPackageHandlers = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/delegations`, ({ params }) => {
    return HttpResponse.json(delegations);
  }),
  http.post(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/delegationcheck`, async ({ request }) => {
    const body = (await request.json()) as {
      packageIds?: string[];
    };
    const { packageIds } = body;

    return HttpResponse.json(
      Array.isArray(packageIds)
        ? packageIds.map((id: string) => ({
            canDelegate: true,
            packageId: id,
            detailCode: 'DelegationAccess',
          }))
        : [],
    );
  }),
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/delegationcheck`, ({ request }) => {
    const url = new URL(request.url);
    const party = url.searchParams.get('party');

    // Return mock delegation check responses with proper structure
    return HttpResponse.json([
      {
        package: {
          id: 'package-1',
          name: 'Test Package 1',
          description: 'Test package description',
          area: {
            id: 'area-1',
            name: 'Test Area',
            description: 'Test area description',
            packages: [],
          },
        },
        result: true,
        reasons: [],
      },
      {
        package: {
          id: 'package-2',
          name: 'Test Package 2',
          description: 'Test package description 2',
          area: {
            id: 'area-2',
            name: 'Test Area 2',
            description: 'Test area description 2',
            packages: [],
          },
        },
        result: false,
        reasons: [
          {
            description: 'Missing required permission',
          },
        ],
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
];

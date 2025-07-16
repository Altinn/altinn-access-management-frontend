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
  http.get(`${ACCESSMANAGEMENT_BASE_URL}/accesspackage/:search`, ({ params }) => {
    const { search } = params;
    if (search === 'error') {
      return HttpResponse.error();
    }
    return HttpResponse.json(packages);
  }),
];

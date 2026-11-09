import { http, HttpResponse } from 'msw';

// Addresses that make the save fail the same way the BFF does, to try the error messages in Storybook
const saveProblems: Record<string, { status: number; code: string }> = {
  'not-in-er@example.com': { status: 400, code: 'STUI-00003' },
  'invalid@example.com': { status: 400, code: 'STUI-00000' },
  'duplicate@example.com': { status: 409, code: 'STUI-00004' },
  'forbidden@example.com': { status: 403, code: 'STUI-00007' },
  'error@example.com': { status: 500, code: 'STUI-00099' },
};

const problemFor = (email?: string) => {
  const problem = email ? saveProblems[email] : undefined;
  return problem ? HttpResponse.json({ code: problem.code }, { status: problem.status }) : null;
};

export const settingsHandler = (ACCESSMANAGEMENT_BASE_URL: string) => [
  http.get(
    `${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses`,
    async ({ params }) => {
      const { orgnumber } = params;

      // Different mock responses based on organization number for different story scenarios
      switch (orgnumber) {
        case 'PARTY_EMPTY_NOTIFICATIONS':
          // Empty notification addresses for testing empty state
          return HttpResponse.json([]);

        case 'PARTY_LOADING':
          // Simulate loading state with delay
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return HttpResponse.json([
            { notificationAddressId: '1', email: 'test1@example.com' },
            { notificationAddressId: '3', phone: '99999999', countryCode: '+47' },
          ]);

        case '310202398':
          // Multiple addresses for testing badge counts
          return HttpResponse.json([
            { notificationAddressId: '1', email: 'admin@company.com' },
            { notificationAddressId: '2', email: 'notifications@company.com' },
            { notificationAddressId: '3', email: 'alerts@company.com' },
            { notificationAddressId: '4', phone: '91234567', countryCode: '+47' },
            { notificationAddressId: '5', phone: '47654321', countryCode: '+47' },
          ]);

        default:
          // Default response with one email and one phone number
          return HttpResponse.json([
            { notificationAddressId: '1', email: 'test1@example.com' },
            { notificationAddressId: '3', phone: '99999999', countryCode: '+47' },
          ]);
      }
    },
  ),
  http.post(
    `${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses`,
    async ({ request }) => {
      const address = (await request.json()) as { email?: string };
      return (
        problemFor(address.email) ?? HttpResponse.json({ ...address, notificationAddressId: 2 })
      );
    },
  ),
  http.delete(
    `${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses/:notificationAddressId`,
    () => {
      return HttpResponse.json({ notificationAddressId: 1, email: 'test1@example.com' });
    },
  ),
  http.put(
    `${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses/:notificationAddressId`,
    async ({ request }) => {
      const address = (await request.json()) as { email?: string };
      return problemFor(address.email) ?? HttpResponse.json(address);
    },
  ),
];

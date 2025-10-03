import { http, HttpResponse } from 'msw';

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
            { notificationAddressId: '4', phone: '12345678', countryCode: '+47' },
            { notificationAddressId: '5', phone: '87654321', countryCode: '+47' },
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
  http.post(`${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses`, () => {
    return HttpResponse.json([{ notificationAddressId: '2', email: 'test2@example.com' }]);
  }),
  http.delete(
    `${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses/:notificationAddressId`,
    () => {
      return HttpResponse.json([{ notificationAddressId: '1', email: 'test1@example.com' }]);
    },
  ),
  http.put(
    `${ACCESSMANAGEMENT_BASE_URL}/settings/org/:orgnumber/notificationaddresses/:notificationAddressId`,
    () => {
      return HttpResponse.json([{ notificationAddressId: '1', email: 'test3@example.com' }]);
    },
  ),
];

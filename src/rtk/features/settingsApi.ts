import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface NotificationAddress {
  notificationAddressId: string;
  countryCode: string;
  email: string;
  phone: string;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'settings';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      const token = getCookie('XSRF-TOKEN');
      if (typeof token === 'string') {
        headers.set('X-XSRF-TOKEN', token);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOrgNotificationAddresses: builder.query<NotificationAddress[], string>({
      query: (orgNumber) => `org/${orgNumber}/notificationaddresses`,
    }),
  }),
});

export const { useGetOrgNotificationAddressesQuery } = settingsApi;

export const { endpoints, reducerPath, reducer, middleware } = settingsApi;

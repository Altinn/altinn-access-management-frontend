import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

export interface NotificationAddress extends Address {
  notificationAddressId: string;
}

export type Address = {
  email: string;
  phone: string;
  countryCode: string;
};

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1/' + 'settings';

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['NotificationAddress'],
  endpoints: (builder) => ({
    getOrgNotificationAddresses: builder.query<NotificationAddress[], string>({
      query: (orgNumber) => `org/${orgNumber}/notificationaddresses`,
      providesTags: ['NotificationAddress'],
    }),
    createOrgNotificationAddress: builder.mutation<
      NotificationAddress,
      { address: Address; orgNumber: string }
    >({
      query: ({ orgNumber, address }) => {
        return {
          url: `org/${orgNumber}/notificationaddresses`,
          method: 'POST',
          body: address,
        };
      },
      invalidatesTags: ['NotificationAddress'],
    }),
    deleteOrgNotificationAddress: builder.mutation<
      void,
      { orgNumber: string; notificationAddressId: string }
    >({
      query: ({ orgNumber, notificationAddressId }) => {
        return {
          url: `org/${orgNumber}/notificationaddresses/${notificationAddressId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['NotificationAddress'],
    }),
  }),
});

export const {
  useGetOrgNotificationAddressesQuery,
  useCreateOrgNotificationAddressMutation,
  useDeleteOrgNotificationAddressMutation,
} = settingsApi;

export const { endpoints, reducerPath, reducer, middleware } = settingsApi;

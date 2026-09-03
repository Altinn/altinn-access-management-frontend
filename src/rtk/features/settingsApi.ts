import { createApi } from '@reduxjs/toolkit/query/react';

import { userInfoApi } from './userInfoApi';

import { createBaseQuery } from '@/rtk/app/baseQuery';

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
  baseQuery: createBaseQuery(baseUrl),
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
    updateOrgNotificationAddress: builder.mutation<
      NotificationAddress,
      { address: NotificationAddress; orgNumber: string }
    >({
      query: ({ orgNumber, address }) => {
        return {
          url: `org/${orgNumber}/notificationaddresses/${address.notificationAddressId}`,
          method: 'PUT',
          body: address,
        };
      },
      invalidatesTags: ['NotificationAddress'],
    }),
    updateSelectedLanguage: builder.mutation<void, string>({
      query: (languageCode) => ({
        url: `language/selectedLanguage`,
        method: 'POST',
        body: { languageCode },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(userInfoApi.util.invalidateTags(['UserProfile']));
      },
    }),
  }),
});

export const {
  useGetOrgNotificationAddressesQuery,
  useCreateOrgNotificationAddressMutation,
  useDeleteOrgNotificationAddressMutation,
  useUpdateOrgNotificationAddressMutation,
  useUpdateSelectedLanguageMutation,
} = settingsApi;

export const { endpoints, reducerPath, reducer, middleware } = settingsApi;

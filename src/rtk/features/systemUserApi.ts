import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  RegisteredSystem,
  SystemUser,
  SystemUserRequest,
  RegisteredSystemRights,
  Customer,
} from '@/features/amUI/systemUser/types';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/`;

enum Tags {
  SystemUsers = 'Systemusers',
}

interface NewSystemUserRequest {
  partyId: string;
  integrationTitle: string;
  systemId: string;
}

export const systemUserApi = createApi({
  reducerPath: 'systemUserApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: [Tags.SystemUsers],
  endpoints: (builder) => ({
    getRegisteredSystems: builder.query<RegisteredSystem[], void>({
      query: () => `/systemregister`,
      keepUnusedDataFor: Infinity,
    }),
    getRegisteredSystemRights: builder.query<RegisteredSystemRights, string>({
      query: (systemId) => `systemregister/rights/${systemId}`,
    }),
    getSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/${partyId}`,
      providesTags: [Tags.SystemUsers],
    }),
    getClientSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/${partyId}`,
      providesTags: [Tags.SystemUsers],
    }),
    getCustomers: builder.query<Customer[], string>({
      query: (partyId) => `systemuser/${partyId}`,
      transformResponse: () => {
        const generateCustomer = () => {
          return {
            id: new Date().getTime().toString() + Math.random(),
            displayName: Math.random().toString(36).slice(2),
            orgNo: Math.floor(Math.random() * 1000000000).toString(),
          };
        };
        return [
          {
            id: '1',
            displayName: 'Svindel AS',
            orgNo: '236147254',
          },
          {
            id: '2',
            displayName: 'Frø og brød AS',
            orgNo: '971032081',
          },
          {
            id: '3',
            displayName: 'Kakespisere AS',
            orgNo: '974761076',
          },
          {
            id: '4',
            displayName: 'Stål og skruer AS',
            orgNo: '991825827',
          },
          {
            id: '5',
            displayName: 'Gjerrigknarkene AS',
            orgNo: '994598759',
          },
          ...Array.from({ length: 200 }).map(() => generateCustomer()),
          {
            id: '6',
            displayName: 'Siste AS',
            orgNo: '994598759',
          },
        ];
      },
    }),
    getAssignedCustomers: builder.query<string[], { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => `systemuser/${partyId}/${systemUserId}`,
      transformResponse: () => {
        return ['1', '2', '3'];
      },
    }),
    assignCustomer: builder.mutation<
      void,
      { partyId: string; systemUserId: string; customerId: string }
    >({
      query: ({ partyId, systemUserId }) => ({
        url: `systemuser/${partyId}/${systemUserId}`,
        method: 'GET',
      }),
    }),
    removeCustomer: builder.mutation<
      void,
      { partyId: string; systemUserId: string; customerId: string }
    >({
      query: ({ partyId, systemUserId }) => ({
        url: `systemuser/${partyId}/${systemUserId}`,
        method: 'GET',
      }),
    }),
    getSystemUser: builder.query<SystemUser, { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => `systemuser/${partyId}/${systemUserId}`,
    }),
    createSystemUser: builder.mutation<{ id: string }, NewSystemUserRequest>({
      query: ({ partyId, ...systemUser }) => ({
        url: `systemuser/${partyId}`,
        method: 'POST',
        body: systemUser,
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    updateSystemuser: builder.mutation<SystemUser, SystemUser & { partyId: string }>({
      query: ({ partyId, ...systemUser }) => ({
        url: `systemuser/${partyId}/${systemUser.id}`,
        method: 'PUT',
        body: systemUser,
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    deleteSystemuser: builder.mutation<void, { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => ({
        url: `systemuser/${partyId}/${systemUserId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    getSystemUserRequest: builder.query<SystemUserRequest, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => `systemuser/request/${partyId}/${requestId}`,
    }),
    approveSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/request/${partyId}/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    rejectSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/request/${partyId}/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    getChangeRequest: builder.query<
      SystemUserRequest,
      { partyId: string; changeRequestId: string }
    >({
      query: ({ partyId, changeRequestId }) =>
        `systemuser/changerequest/${partyId}/${changeRequestId}`,
    }),
    approveChangeRequest: builder.mutation<void, { partyId: string; changeRequestId: string }>({
      query: ({ partyId, changeRequestId }) => ({
        url: `systemuser/changerequest/${partyId}/${changeRequestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    rejectChangeRequest: builder.mutation<void, { partyId: string; changeRequestId: string }>({
      query: ({ partyId, changeRequestId }) => ({
        url: `systemuser/changerequest/${partyId}/${changeRequestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    getClientSystemUserRequest: builder.query<
      SystemUserRequest,
      { partyId: string; requestId: string }
    >({
      query: ({ partyId, requestId }) => `systemuser/clientrequest/${partyId}/${requestId}`,
    }),
    approveClientSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/clientrequest/${partyId}/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    rejectClientSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/clientrequest/${partyId}/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
  }),
});

const apiWithTag = systemUserApi.enhanceEndpoints({
  addTagTypes: [Tags.SystemUsers],
});

export const {
  useCreateSystemUserMutation,
  useDeleteSystemuserMutation,
  useGetSystemUserQuery,
  useGetSystemUsersQuery,
  useGetCustomersQuery,
  useGetAssignedCustomersQuery,
  useAssignCustomerMutation,
  useRemoveCustomerMutation,
  useGetClientSystemUsersQuery,
  useUpdateSystemuserMutation,
  useGetRegisteredSystemsQuery,
  useGetRegisteredSystemRightsQuery,
  useGetSystemUserRequestQuery,
  useApproveSystemUserRequestMutation,
  useRejectSystemUserRequestMutation,
  useGetChangeRequestQuery,
  useApproveChangeRequestMutation,
  useRejectChangeRequestMutation,
  useGetClientSystemUserRequestQuery,
  useApproveClientSystemUserRequestMutation,
  useRejectClientSystemUserRequestMutation,
} = apiWithTag;

export const { endpoints, reducerPath, reducer, middleware } = apiWithTag;

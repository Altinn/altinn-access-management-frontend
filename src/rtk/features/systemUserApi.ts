import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  RegisteredSystem,
  SystemUser,
  SystemUserChangeRequest,
  SystemUserRequest,
} from '@/features/systemUser/types';

import type { ServiceResource } from './singleRights/singleRightsApi';

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
    getRegisteredSystemRights: builder.query<ServiceResource[], string>({
      query: (systemId) => `systemregister/rights/${systemId}`,
    }),
    getSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/${partyId}`,
      providesTags: [Tags.SystemUsers],
    }),
    getSystemUser: builder.query<SystemUser, { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => `systemuser/${partyId}/${systemUserId}`,
    }),
    createSystemUser: builder.mutation<string, NewSystemUserRequest>({
      query: ({ partyId, ...systemUser }) => ({
        url: `systemuser/${partyId}`,
        method: 'POST',
        body: systemUser,
        responseHandler: 'text',
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
      SystemUserChangeRequest,
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
  }),
});

export const {
  useCreateSystemUserMutation,
  useDeleteSystemuserMutation,
  useGetSystemUserQuery,
  useGetSystemUsersQuery,
  useUpdateSystemuserMutation,
  useGetRegisteredSystemsQuery,
  useGetRegisteredSystemRightsQuery,
  useGetSystemUserRequestQuery,
  useApproveSystemUserRequestMutation,
  useRejectSystemUserRequestMutation,
  useGetChangeRequestQuery,
  useApproveChangeRequestMutation,
  useRejectChangeRequestMutation,
} = systemUserApi;

export const { endpoints, reducerPath, reducer, middleware } = systemUserApi;

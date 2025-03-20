import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  RegisteredSystem,
  SystemUser,
  SystemUserRequest,
  RegisteredSystemRights,
  AgentDelegationCustomer,
  AgentDelegation,
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
    // systemregister
    getRegisteredSystems: builder.query<RegisteredSystem[], void>({
      query: () => `/systemregister`,
      keepUnusedDataFor: Infinity,
    }),
    getRegisteredSystemRights: builder.query<RegisteredSystemRights, string>({
      query: (systemId) => `systemregister/rights/${systemId}`,
    }),

    // systemuser
    getSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/${partyId}`,
      providesTags: [Tags.SystemUsers],
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

    // agent delegation systemuser
    getAgentSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/agent/${partyId}`,
      providesTags: [Tags.SystemUsers],
    }),
    getAgentSystemUser: builder.query<SystemUser, { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => `systemuser/agent/${partyId}/${systemUserId}`,
    }),
    getCustomers: builder.query<
      AgentDelegationCustomer[],
      { partyId: string; partyUuid: string; systemUserId: string }
    >({
      query: ({ partyId, partyUuid, systemUserId }) =>
        `systemuser/agentdelegation/${partyId}/${partyUuid}/${systemUserId}/customers`,
      keepUnusedDataFor: Infinity,
    }),
    getAssignedCustomers: builder.query<
      AgentDelegation[],
      { partyId: string; systemUserId: string }
    >({
      query: ({ partyId, systemUserId }) =>
        `systemuser/agentdelegation/${partyId}/${systemUserId}/delegation`,
    }),
    assignCustomer: builder.mutation<
      AgentDelegation,
      { partyId: string; systemUserId: string; partyUuid: string; customerId: string }
    >({
      query: ({ partyId, systemUserId, partyUuid, customerId }) => ({
        url: `systemuser/agentdelegation/${partyId}/${systemUserId}/delegation`,
        method: 'POST',
        body: {
          customerId: customerId,
          facilitatorId: partyUuid,
        },
      }),
    }),
    removeCustomer: builder.mutation<
      void,
      { partyId: string; systemUserId: string; assignmentId: string }
    >({
      query: ({ partyId, systemUserId, assignmentId }) => ({
        url: `systemuser/agentdelegation/${partyId}/${systemUserId}/delegation/${assignmentId}`,
        method: 'DELETE',
      }),
    }),

    // system user request
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

    // change request
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

    // agent request
    getAgentSystemUserRequest: builder.query<
      SystemUserRequest,
      { partyId: string; requestId: string }
    >({
      query: ({ partyId, requestId }) => `systemuser/agentrequest/${partyId}/${requestId}`,
    }),
    approveAgentSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/agentrequest/${partyId}/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    rejectAgentSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/agentrequest/${partyId}/${requestId}/reject`,
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
  useGetAgentSystemUsersQuery,
  useGetAgentSystemUserQuery,
  useUpdateSystemuserMutation,
  useGetRegisteredSystemsQuery,
  useGetRegisteredSystemRightsQuery,
  useGetSystemUserRequestQuery,
  useApproveSystemUserRequestMutation,
  useRejectSystemUserRequestMutation,
  useGetChangeRequestQuery,
  useApproveChangeRequestMutation,
  useRejectChangeRequestMutation,
  useGetAgentSystemUserRequestQuery,
  useApproveAgentSystemUserRequestMutation,
  useRejectAgentSystemUserRequestMutation,
} = apiWithTag;

export const { endpoints, reducerPath, reducer, middleware } = apiWithTag;

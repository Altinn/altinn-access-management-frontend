import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  RegisteredSystem,
  SystemUser,
  SystemUserRequest,
  RegisteredSystemRights,
  AgentDelegationCustomer,
  AgentDelegation,
  SystemUserChangeRequest,
} from '@/features/amUI/systemUser/types';

import type { ReporteeInfo } from './userInfoApi';
import { formatDisplayName } from '@altinn/altinn-components';

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/`;

enum Tags {
  SystemUsers = 'Systemusers',
  PendingSystemUsers = 'PendingSystemusers',
}

interface NewSystemUserRequest {
  partyId: string;
  integrationTitle: string;
  systemId: string;
}

const formatSystemVendorName = (system: RegisteredSystem) => {
  return {
    ...system,
    systemVendorOrgName: formatDisplayName({
      fullName: system.systemVendorOrgName,
      type: 'company',
    }),
  };
};

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
  tagTypes: [Tags.SystemUsers, Tags.PendingSystemUsers],
  endpoints: (builder) => ({
    // system user reportee
    getSystemUserReportee: builder.query<ReporteeInfo, string>({
      keepUnusedDataFor: 300,
      query: (partyId) => `user/reportee/${partyId}`,
      transformResponse: (response: ReporteeInfo) => {
        return {
          ...response,
          name: formatDisplayName({ fullName: response.name, type: 'company' }),
        };
      },
    }),

    // systemregister
    getRegisteredSystems: builder.query<RegisteredSystem[], void>({
      query: () => `/systemregister`,
      keepUnusedDataFor: Infinity,
      transformResponse: (response: RegisteredSystem[]) => {
        return response.map(formatSystemVendorName);
      },
    }),
    getRegisteredSystemRights: builder.query<RegisteredSystemRights, string>({
      query: (systemId) => `systemregister/rights/${systemId}`,
    }),

    // systemuser
    getSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/${partyId}`,
      providesTags: [Tags.SystemUsers],
      transformResponse: (response: SystemUser[]) => {
        return response.map((x) => {
          return {
            ...x,
            system: formatSystemVendorName(x.system),
          };
        });
      },
    }),
    getSystemUser: builder.query<SystemUser, { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => `systemuser/${partyId}/${systemUserId}`,
      transformResponse: (response: SystemUser) => {
        return {
          ...response,
          system: formatSystemVendorName(response.system),
        };
      },
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
    getPendingSystemUserRequests: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/${partyId}/pending`,
      providesTags: [Tags.PendingSystemUsers],
      transformResponse: (response: SystemUser[]) => {
        return response.map((x) => {
          return {
            ...x,
            system: formatSystemVendorName(x.system),
          };
        });
      },
    }),

    // agent delegation systemuser
    getAgentSystemUsers: builder.query<SystemUser[], string>({
      query: (partyId) => `systemuser/agent/${partyId}`,
      providesTags: [Tags.SystemUsers],
      transformResponse: (response: SystemUser[]) => {
        return response.map((x) => {
          return {
            ...x,
            system: formatSystemVendorName(x.system),
          };
        });
      },
    }),
    getAgentSystemUser: builder.query<SystemUser, { partyId: string; systemUserId: string }>({
      query: ({ partyId, systemUserId }) => `systemuser/agent/${partyId}/${systemUserId}`,
      transformResponse: (response: SystemUser) => {
        return {
          ...response,
          system: formatSystemVendorName(response.system),
        };
      },
    }),
    deleteAgentSystemuser: builder.mutation<
      void,
      { partyId: string; systemUserId: string; partyUuid: string }
    >({
      query: ({ partyId, systemUserId, partyUuid }) => ({
        url: `systemuser/agent/${partyId}/${systemUserId}?partyuuid=${partyUuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: [Tags.SystemUsers],
    }),
    getCustomers: builder.query<
      AgentDelegationCustomer[],
      { partyId: string; systemUserId: string; partyUuid: string }
    >({
      query: ({ partyId, systemUserId, partyUuid }) =>
        `systemuser/agentdelegation/${partyId}/${systemUserId}/customers?partyuuid=${partyUuid}`,
      keepUnusedDataFor: Infinity,
      transformResponse: (response: AgentDelegationCustomer[]) => {
        return response.map((x) => {
          return {
            ...x,
            name: formatDisplayName({ fullName: x.name, type: 'company' }),
          };
        });
      },
    }),
    getAssignedCustomers: builder.query<
      AgentDelegation[],
      { partyId: string; systemUserId: string; partyUuid: string }
    >({
      query: ({ partyId, systemUserId, partyUuid }) =>
        `systemuser/agentdelegation/${partyId}/${systemUserId}/delegation?partyuuid=${partyUuid}`,
      keepUnusedDataFor: 0,
    }),
    assignCustomer: builder.mutation<
      AgentDelegation,
      {
        partyId: string;
        systemUserId: string;
        customer: AgentDelegationCustomer;
        partyUuid: string;
      }
    >({
      query: ({ partyId, systemUserId, customer, partyUuid }) => ({
        url: `systemuser/agentdelegation/${partyId}/${systemUserId}/delegation?partyuuid=${partyUuid}`,
        method: 'POST',
        body: {
          customerId: customer.id,
          access: customer.access,
        },
      }),
    }),
    removeCustomer: builder.mutation<
      void,
      { partyId: string; systemUserId: string; delegationId: string; partyUuid: string }
    >({
      query: ({ partyId, systemUserId, delegationId, partyUuid }) => ({
        url: `systemuser/agentdelegation/${partyId}/${systemUserId}/delegation/${delegationId}?partyuuid=${partyUuid}`,
        method: 'DELETE',
      }),
    }),

    // system user request
    getSystemUserRequest: builder.query<SystemUserRequest, { requestId: string }>({
      query: ({ requestId }) => `systemuser/request/${requestId}`,
      transformResponse: (response: SystemUserRequest) => {
        return {
          ...response,
          system: formatSystemVendorName(response.system),
        };
      },
    }),
    approveSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/request/${partyId}/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers, Tags.PendingSystemUsers],
    }),
    rejectSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/request/${partyId}/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers, Tags.PendingSystemUsers],
    }),
    escalateRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/request/${partyId}/${requestId}/escalate`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.PendingSystemUsers],
    }),

    // change request
    getChangeRequest: builder.query<SystemUserChangeRequest, { changeRequestId: string }>({
      query: ({ changeRequestId }) => `systemuser/changerequest/${changeRequestId}`,
      transformResponse: (response: SystemUserChangeRequest) => {
        return {
          ...response,
          system: formatSystemVendorName(response.system),
        };
      },
    }),
    approveChangeRequest: builder.mutation<void, { partyId: string; changeRequestId: string }>({
      query: ({ partyId, changeRequestId }) => ({
        url: `systemuser/changerequest/${partyId}/${changeRequestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers, Tags.PendingSystemUsers],
    }),
    rejectChangeRequest: builder.mutation<void, { partyId: string; changeRequestId: string }>({
      query: ({ partyId, changeRequestId }) => ({
        url: `systemuser/changerequest/${partyId}/${changeRequestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers, Tags.PendingSystemUsers],
    }),

    // agent request
    getAgentSystemUserRequest: builder.query<SystemUserRequest, { requestId: string }>({
      query: ({ requestId }) => `systemuser/agentrequest/${requestId}`,
      transformResponse: (response: SystemUserRequest) => {
        return {
          ...response,
          system: formatSystemVendorName(response.system),
        };
      },
    }),
    approveAgentSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/agentrequest/${partyId}/${requestId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers, Tags.PendingSystemUsers],
    }),
    rejectAgentSystemUserRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/agentrequest/${partyId}/${requestId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.SystemUsers, Tags.PendingSystemUsers],
    }),
    escalateAgentRequest: builder.mutation<void, { partyId: string; requestId: string }>({
      query: ({ partyId, requestId }) => ({
        url: `systemuser/agentrequest/${partyId}/${requestId}/escalate`,
        method: 'POST',
      }),
      invalidatesTags: [Tags.PendingSystemUsers],
    }),
  }),
});

const apiWithTag = systemUserApi.enhanceEndpoints({
  addTagTypes: [Tags.SystemUsers, Tags.PendingSystemUsers],
});

export const {
  useGetSystemUserReporteeQuery,
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
  useDeleteAgentSystemuserMutation,
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
  useGetPendingSystemUserRequestsQuery,
  useEscalateRequestMutation,
  useEscalateAgentRequestMutation,
} = apiWithTag;

export const { endpoints, reducerPath, reducer, middleware } = apiWithTag;

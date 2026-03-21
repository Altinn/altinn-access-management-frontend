import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { SimplifiedConnection, SimplifiedParty, PersonInput } from './connectionApi';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import type {
  DelegationCheckedRight,
  RightAccess,
  ServiceResource,
} from './singleRights/singleRightsApi';

interface InstanceType {
  id: string;
  name: string;
}

export interface DelegationInstance {
  refId: string;
  type: InstanceType | null;
}

export interface InstanceDelegation {
  resource: ServiceResource;
  instance: DelegationInstance;
  permissions: Permissions[];
}

export interface InstanceRights {
  resource: ServiceResource;
  instance: DelegationInstance;
  directRights: RightAccess[];
  indirectRights: RightAccess[];
}

export interface InstanceRightsDelegationDto {
  to?: PersonInput;
  directRightKeys: string[];
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const instanceApi = createApi({
  reducerPath: 'instanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['instances', 'instanceRights', 'instanceDelegationCheck'],
  endpoints: (builder) => ({
    getInstances: builder.query<
      InstanceDelegation[],
      { party: string; from?: string; to?: string; resource?: string; instance?: string }
    >({
      query: ({ party, from, to, resource, instance }) => {
        return `instances/delegation/instances?party=${party}&from=${from ?? ''}&to=${to ?? ''}&resource=${encodeURIComponent(resource ?? '')}&instance=${encodeURIComponent(instance ?? '')}`;
      },
      providesTags: ['instances'],
    }),
    getInstanceRights: builder.query<
      InstanceRights,
      { party: string; from: string; to: string; resource: string; instance: string }
    >({
      query: ({ party, from, to, resource, instance }) =>
        `instances/delegation/instances/rights?party=${party}&from=${from}&to=${to}&resource=${encodeURIComponent(resource)}&instance=${encodeURIComponent(instance)}`,
      providesTags: ['instanceRights'],
    }),
    instanceDelegationCheck: builder.query<
      DelegationCheckedRight[],
      { party: string; resource: string; instance: string }
    >({
      query: ({ party, resource, instance }) =>
        `instances/delegationcheck?party=${party}&resource=${encodeURIComponent(resource)}&instance=${encodeURIComponent(instance)}`,
      providesTags: ['instanceDelegationCheck'],
    }),
    delegateInstanceRights: builder.mutation<
      void,
      {
        party: string;
        to?: string;
        resource: string;
        instance: string;
        input: InstanceRightsDelegationDto;
      }
    >({
      query: ({ party, to, resource, instance, input }) => ({
        url: `instances/delegation/instances/rights?party=${party}${to ? `&to=${to}` : ''}&resource=${encodeURIComponent(resource)}&instance=${encodeURIComponent(instance)}`,
        method: 'POST',
        body: JSON.stringify(input),
      }),
      transformResponse: () => undefined,
      invalidatesTags: ['instances', 'instanceRights', 'instanceDelegationCheck'],
    }),
    updateInstanceRights: builder.mutation<
      void,
      { party: string; to: string; resource: string; instance: string; actionKeys: string[] }
    >({
      query: ({ party, to, resource, instance, actionKeys }) => ({
        url: `instances/delegation/instances/rights?party=${party}&to=${to}&resource=${encodeURIComponent(resource)}&instance=${encodeURIComponent(instance)}`,
        method: 'PUT',
        body: JSON.stringify(actionKeys),
      }),
      invalidatesTags: ['instances', 'instanceRights', 'instanceDelegationCheck'],
    }),

    /**
     * Gets users who have direct access to a specific instance (simplified parties).
     * Limited endpoint for instance admins without full admin access.
     * Backend: GET enduser/connections/resources/instances/users
     */
    getInstanceUsers: builder.query<
      SimplifiedParty[],
      { partyUuid: string; resource: string; instance: string }
    >({
      query: ({ partyUuid, resource, instance }) =>
        `instances/delegation/instances/simplified/users?party=${partyUuid}&resource=${encodeURIComponent(resource)}&instance=${encodeURIComponent(instance)}`,
      keepUnusedDataFor: 3,
      providesTags: ['instances'],
    }),
    /**
     * Gets available users for instance delegation as simplified connections.
     * Limited endpoint for instance admins without full admin access.
     * Backend: GET enduser/connections/users
     */
    getAvailableUsers: builder.query<SimplifiedConnection[], { partyUuid: string }>({
      query: ({ partyUuid }) => `instances/delegation/available-users?party=${partyUuid}`,
      keepUnusedDataFor: 3,
      providesTags: ['instances'],
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
  }),
});

export const {
  useGetInstancesQuery,
  useGetInstanceRightsQuery,
  useInstanceDelegationCheckQuery,
  useDelegateInstanceRightsMutation,
  useUpdateInstanceRightsMutation,
  useGetInstanceUsersQuery,
  useGetAvailableUsersQuery,
} = instanceApi;

export const { endpoints, reducerPath, reducer, middleware } = instanceApi;

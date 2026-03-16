import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import type { DelegationResult } from '@/dataObjects/dtos/resourceDelegation';

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
  id: string;
  urn: string;
  type: InstanceType;
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
      DelegationResult,
      { party: string; to: string; resource: string; instance: string; actionKeys: string[] }
    >({
      query: ({ party, to, resource, instance, actionKeys }) => ({
        url: `instances/delegation/instances/rights?party=${party}&to=${to}&resource=${encodeURIComponent(resource)}&instance=${encodeURIComponent(instance)}`,
        method: 'POST',
        body: JSON.stringify(actionKeys),
      }),
      transformErrorResponse: (response: { status: string | number }) => response.status,
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
  }),
});

export const {
  useGetInstancesQuery,
  useGetInstanceRightsQuery,
  useInstanceDelegationCheckQuery,
  useDelegateInstanceRightsMutation,
  useUpdateInstanceRightsMutation,
} = instanceApi;

export const { endpoints, reducerPath, reducer, middleware } = instanceApi;

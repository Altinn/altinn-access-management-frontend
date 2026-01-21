import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { Entity } from '@/dataObjects/dtos/Common';
import { Role } from './roleApi';
import { AccessPackage } from './accessPackageApi';
import { PersonInput } from './connectionApi';

export interface ClientAccess {
  role: Role;
  packages: AccessPackage[];
}

export interface Client {
  client: Entity;
  access: ClientAccess[];
}

export interface Agent {
  agent: Entity;
  access: ClientAccess[];
}

export interface AssignmentDto {
  id: string;
  roleId: string;
  fromId: string;
  toId: string;
}

export interface DelegationBatchPermission {
  role: string;
  package: string[];
}

export interface DelegationBatchInput {
  values: DelegationBatchPermission[];
}

export interface DelegationDto {
  roleId: string;
  packageId: string;
  viaId: string;
  fromId: string;
  toId: string;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/clientdelegations`;

export const clientApi = createApi({
  reducerPath: 'clientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['clients', 'agents', 'agentAccessPackages', 'clientAccessPackages'],
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      query: () => `clients?party=${getCookie('AltinnPartyUuid')}`,
      keepUnusedDataFor: 3,
      providesTags: ['clients'],
    }),
    getAgents: builder.query<Agent[], void>({
      query: () => `agents?party=${getCookie('AltinnPartyUuid')}`,
      keepUnusedDataFor: 3,
      providesTags: ['agents'],
    }),
    getAgentAccessPackages: builder.query<Client[], { to: string; party?: string }>({
      query: ({ to, party = getCookie('AltinnPartyUuid') }) =>
        `agents/accesspackages?party=${party}&to=${to}`,
      keepUnusedDataFor: 3,
      providesTags: ['agentAccessPackages'],
    }),
    getClientAccessPackages: builder.query<Agent[], { from: string; party?: string }>({
      query: ({ from, party = getCookie('AltinnPartyUuid') }) =>
        `clients/accesspackages?party=${party}&from=${from}`,
      keepUnusedDataFor: 3,
      providesTags: ['clientAccessPackages'],
    }),
    addAgentAccessPackages: builder.mutation<
      DelegationDto[],
      { from: string; to: string; payload: DelegationBatchInput; party?: string }
    >({
      query: ({ from, to, payload, party = getCookie('AltinnPartyUuid') }) => ({
        url: `agents/accesspackages?party=${party}&from=${from}&to=${to}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['agentAccessPackages', 'clientAccessPackages'],
    }),
    removeAgentAccessPackages: builder.mutation<
      void,
      { from: string; to: string; payload: DelegationBatchInput; party?: string }
    >({
      query: ({ from, to, payload, party = getCookie('AltinnPartyUuid') }) => ({
        url: `agents/accesspackages?party=${party}&from=${from}&to=${to}`,
        method: 'DELETE',
        body: payload,
      }),
      invalidatesTags: ['agentAccessPackages', 'clientAccessPackages'],
    }),
    addAgent: builder.mutation<AssignmentDto, { to?: string; personInput?: PersonInput }>({
      query: ({ to, personInput }) => ({
        url: `agents?party=${getCookie('AltinnPartyUuid')}${to ? `&to=${to}` : ''}`,
        method: 'POST',
        body: personInput ? JSON.stringify(personInput) : undefined,
      }),
      invalidatesTags: ['agents'],
    }),
    removeAgent: builder.mutation<void, { to: string; party?: string }>({
      query: ({ to, party = getCookie('AltinnPartyUuid') }) => ({
        url: `agents?party=${party}&to=${to}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['agents'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetAgentsQuery,
  useGetAgentAccessPackagesQuery,
  useGetClientAccessPackagesQuery,
  useAddAgentAccessPackagesMutation,
  useRemoveAgentAccessPackagesMutation,
  useAddAgentMutation,
  useRemoveAgentMutation,
} = clientApi;

export const { endpoints, reducerPath, reducer, middleware } = clientApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

import { Entity } from '@/dataObjects/dtos/Common';
import type { Party } from './lookupApi';
import { ExtendedUser } from './userInfoApi';

export enum ConnectionUserType {
  Person = 'Person',
  Organization = 'Organisasjon',
  Systemuser = 'Systembruker',
}

export interface RoleInfo {
  id: string;
  code?: string;
  viaParty?: Entity;
}

export interface Connection {
  party: ExtendedUser;
  roles: RoleInfo[];
  connections: Connection[];
  sortKey?: string;
}

export interface UserInfo {
  name: string;
  uuid: string;
  party: Party;
}

export type PersonInput = {
  personIdentifier: string;
  lastName: string;
};

/** Simplified party info from limited endpoints (for isClientAdmin without isAdmin) */
export interface SimplifiedParty {
  id: string;
  name: string;
  type?: string;
  variant?: string;
  organizationIdentifier?: string;
  isDeleted?: boolean;
}

/** Simplified connection from GET connections/users (for isClientAdmin without isAdmin) */
export interface SimplifiedConnection {
  party: SimplifiedParty;
  connections: SimplifiedConnection[];
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/connection`;

export const connectionApi = createApi({
  reducerPath: 'connectionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['Connections'],
  endpoints: (builder) => ({
    addRightHolder: builder.mutation<
      string,
      { partyUuidToBeAdded?: string; personInput?: PersonInput }
    >({
      query: ({ partyUuidToBeAdded, personInput }) => ({
        url: `reportee/${getCookie('AltinnPartyUuid')}/rightholder?rightholderPartyUuid=${partyUuidToBeAdded}`,
        method: 'POST',
        body: personInput ? JSON.stringify(personInput) : undefined,
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
      invalidatesTags: ['Connections'],
    }),
    getRightHolders: builder.query<
      Connection[],
      {
        partyUuid: string;
        fromUuid?: string;
        toUuid?: string;
        includeClientDelegations?: boolean;
        includeAgentConnections?: boolean;
      }
    >({
      query: ({
        partyUuid,
        fromUuid,
        toUuid,
        includeClientDelegations = true,
        includeAgentConnections = true,
      }) =>
        `rightholders?party=${partyUuid}&from=${fromUuid}&to=${toUuid}&includeClientDelegations=${includeClientDelegations}&includeAgentConnections=${includeAgentConnections}`,
      keepUnusedDataFor: 3,
      providesTags: ['Connections'],
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    removeRightHolder: builder.mutation<void, { party: string; to: string; from: string }>({
      query: ({ party, to, from }) => ({
        url: `reportee?party=${party}&to=${to}&from=${from}`,
        method: 'DELETE',
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
    validateNewUserPerson: builder.mutation<string, { ssn: string; lastName: string }>({
      query: ({ ssn, lastName }) => ({
        url: `reportee/${getCookie('AltinnPartyUuid')}/rightholder/validateperson`,
        method: 'POST',
        body: JSON.stringify({ ssn, lastName }),
      }),
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number } => {
        return { status: response.status };
      },
    }),

    /**
     * Gets available users (simplified connections) for a party.
     * Limited endpoint for client admins (isClientAdmin) who don't have full admin access.
     * Backend: GET enduser/connections/users
     */
    getAvailableUsers: builder.query<SimplifiedConnection[], { partyUuid: string }>({
      query: ({ partyUuid }) => `simplified/users?party=${partyUuid}`,
      keepUnusedDataFor: 3,
      providesTags: ['Connections'],
      transformErrorResponse: (response: {
        status: string | number;
      }): { status: string | number; data: string } => {
        return { status: response.status, data: new Date().toISOString() };
      },
    }),
  }),
});

export const {
  useGetRightHoldersQuery,
  useAddRightHolderMutation,
  useRemoveRightHolderMutation,
  useValidateNewUserPersonMutation,
  useGetAvailableUsersQuery,
} = connectionApi;

export const { endpoints, reducerPath, reducer, middleware } = connectionApi;

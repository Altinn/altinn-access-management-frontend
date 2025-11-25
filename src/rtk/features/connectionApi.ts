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
  displayName?: string;
  viaParty?: Entity;
}

export interface Connection {
  party: ExtendedUser;
  roles: RoleInfo[];
  connections: Connection[];
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
    }),
    getRightHolders: builder.query<
      Connection[],
      { partyUuid: string; fromUuid?: string; toUuid?: string }
    >({
      query: ({ partyUuid, fromUuid, toUuid }) =>
        `rightholders?party=${partyUuid}&from=${fromUuid}&to=${toUuid}`,
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
  }),
});

export const {
  useGetRightHoldersQuery,
  useAddRightHolderMutation,
  useRemoveRightHolderMutation,
  useValidateNewUserPersonMutation,
} = connectionApi;

export const { endpoints, reducerPath, reducer, middleware } = connectionApi;

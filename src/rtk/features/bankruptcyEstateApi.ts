import { createApi } from '@reduxjs/toolkit/query/react';

import { type CompactRole } from '@/dataObjects/dtos/Common';
import { type PartyEntity } from '@/dataObjects/dtos/Party';
import { createBaseQuery } from '@/rtk/app/baseQuery';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { type AssignmentDto } from './clientApi';
import { type PersonInput } from './connectionApi';

export interface BankruptcyEstateAdministrator {
  administrator: PartyEntity;
  adminRole: CompactRole;
  adminAddedAt: string;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/bankruptcyestate`;

export const bankruptcyEstateApi = createApi({
  reducerPath: 'bankruptcyEstateApi',
  baseQuery: createBaseQuery(baseUrl),
  tagTypes: ['administrators'],
  endpoints: (builder) => ({
    getIsBankruptcyEstateAdmin: builder.query<boolean, void>({
      query: () => `isBankruptcyEstateAdmin?party=${getCookie('AltinnPartyUuid')}`,
    }),
    getAdministrators: builder.query<BankruptcyEstateAdministrator[], void>({
      query: () => `administrators?party=${getCookie('AltinnPartyUuid')}`,
      providesTags: ['administrators'],
    }),
    addAdministrator: builder.mutation<AssignmentDto, PersonInput>({
      query: (personInput) => ({
        url: `administrators?party=${getCookie('AltinnPartyUuid')}`,
        method: 'POST',
        body: JSON.stringify(personInput),
      }),
      invalidatesTags: ['administrators'],
    }),
    removeAdministrator: builder.mutation<void, { user: string }>({
      query: ({ user }) => ({
        url: `administrators?party=${getCookie('AltinnPartyUuid')}&user=${user}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['administrators'],
    }),
  }),
});

export const {
  useGetIsBankruptcyEstateAdminQuery,
  useGetAdministratorsQuery,
  useAddAdministratorMutation,
  useRemoveAdministratorMutation,
} = bankruptcyEstateApi;

export const { endpoints, reducerPath, reducer, middleware } = bankruptcyEstateApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { CompactRole, Entity } from '@/dataObjects/dtos/Common';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { AssignmentDto } from './clientApi';

export interface MaskinportenConnection {
  party: Entity;
  roles: CompactRole[];
  connections: MaskinportenConnection[];
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/maskinporten`;

export const maskinportenApi = createApi({
  reducerPath: 'maskinportenApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['maskinportenSuppliers', 'maskinportenConsumers'],
  endpoints: (builder) => ({
    getMaskinportenSuppliers: builder.query<MaskinportenConnection[], { party?: string } | void>({
      query: (args) => `suppliers?party=${args?.party ?? getCookie('AltinnPartyUuid')}`,
      providesTags: ['maskinportenSuppliers'],
    }),
    getMaskinportenConsumers: builder.query<MaskinportenConnection[], { party?: string } | void>({
      query: (args) => `consumers?party=${args?.party ?? getCookie('AltinnPartyUuid')}`,
      providesTags: ['maskinportenConsumers'],
    }),
    addMaskinportenSupplier: builder.mutation<AssignmentDto, { party: string; supplier: string }>({
      query: ({ party, supplier }) => ({
        url: `suppliers?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}`,
        method: 'POST',
      }),
      invalidatesTags: ['maskinportenSuppliers'],
    }),
  }),
});

export const {
  useGetMaskinportenSuppliersQuery,
  useGetMaskinportenConsumersQuery,
  useAddMaskinportenSupplierMutation,
} = maskinportenApi;

export const { endpoints, reducerPath, reducer, middleware } = maskinportenApi;

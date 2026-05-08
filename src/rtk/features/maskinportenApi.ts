import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { CompactRole, Entity } from '@/dataObjects/dtos/Common';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import type {
  DelegationCheckedRight,
  ResourceDelegation,
  ServiceResource,
} from './singleRights/singleRightsApi';
import type { AssignmentDto } from './clientApi';

export interface MaskinportenConnection {
  party: Entity;
  roles: CompactRole[];
}

interface PaginatedMaskinportenScopeSearchResult {
  page: number;
  numEntriesTotal: number;
  pageList: ServiceResource[];
}

interface MaskinportenScopeSearchParams {
  searchString: string;
  ROfilters: string[];
  page: number;
  resultsPerPage: number;
}

interface MaskinportenResourceDelegationCheckResult {
  resource: {
    name: string;
    refId: string;
  };
  rights: DelegationCheckedRight[];
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
  tagTypes: [
    'maskinportenSuppliers',
    'maskinportenConsumers',
    'maskinportenResourceDelegationCheck',
    'maskinportenResources',
  ],
  endpoints: (builder) => ({
    getMaskinportenSuppliers: builder.query<
      MaskinportenConnection[],
      { party?: string; supplier?: string } | void
    >({
      query: (args) => {
        const party = args?.party ?? getCookie('AltinnPartyUuid');
        const base = `suppliers?party=${party}`;
        return args?.supplier ? `${base}&supplier=${encodeURIComponent(args.supplier)}` : base;
      },
      providesTags: ['maskinportenSuppliers'],
    }),
    getMaskinportenConsumers: builder.query<MaskinportenConnection[], { party?: string } | void>({
      query: (args) => `consumers?party=${args?.party ?? getCookie('AltinnPartyUuid')}`,
      providesTags: ['maskinportenConsumers'],
    }),
    searchMaskinportenScopes: builder.query<
      PaginatedMaskinportenScopeSearchResult,
      MaskinportenScopeSearchParams
    >({
      query: ({ searchString, ROfilters, page, resultsPerPage }) => {
        const params = new URLSearchParams({
          Page: String(page),
          ResultsPerPage: String(resultsPerPage),
          SearchString: searchString,
        });
        ROfilters.forEach((filter) => params.append('ROFilters', filter));

        return `scopes/search?${params.toString()}`;
      },
    }),
    maskinportenResourceDelegationCheck: builder.query<
      MaskinportenResourceDelegationCheckResult,
      { party?: string; resource: string }
    >({
      query: ({ party, resource }) =>
        `resources/delegationcheck?party=${party ?? getCookie('AltinnPartyUuid')}&resource=${encodeURIComponent(resource)}`,
      providesTags: ['maskinportenResourceDelegationCheck'],
    }),
    addMaskinportenResource: builder.mutation<
      boolean,
      { party: string; supplier: string; resource: string }
    >({
      query: ({ party, supplier, resource }) => ({
        url: `resources?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}&resource=${encodeURIComponent(resource)}`,
        method: 'POST',
      }),
      invalidatesTags: ['maskinportenResourceDelegationCheck', 'maskinportenResources'],
    }),
    getMaskinportenResources: builder.query<
      ResourceDelegation[],
      { party?: string; supplier?: string; resource?: string }
    >({
      query: ({ party, supplier, resource }) => {
        const params = new URLSearchParams({
          party: party ?? getCookie('AltinnPartyUuid'),
        });

        if (supplier) {
          params.append('supplier', supplier);
        }

        if (resource) {
          params.append('resource', resource);
        }

        return `resources?${params.toString()}`;
      },
      providesTags: ['maskinportenResources'],
    }),
    removeMaskinportenResource: builder.mutation<
      void,
      { party: string; supplier: string; resource: string }
    >({
      query: ({ party, supplier, resource }) => ({
        url: `resources?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}&resource=${encodeURIComponent(resource)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['maskinportenResourceDelegationCheck', 'maskinportenResources'],
    }),
    addMaskinportenSupplier: builder.mutation<AssignmentDto, { party: string; supplier: string }>({
      query: ({ party, supplier }) => ({
        url: `suppliers?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}`,
        method: 'POST',
      }),
      invalidatesTags: ['maskinportenSuppliers'],
    }),
    removeMaskinportenSupplier: builder.mutation<
      void,
      { party: string; supplier: string; cascade?: boolean }
    >({
      query: ({ party, supplier, cascade = false }) => ({
        url: `suppliers?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}&cascade=${cascade}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['maskinportenSuppliers'],
    }),
    removeMaskinportenConsumer: builder.mutation<
      void,
      { party: string; consumer: string; cascade?: boolean }
    >({
      query: ({ party, consumer, cascade = false }) => ({
        url: `consumers?party=${encodeURIComponent(party)}&consumer=${encodeURIComponent(consumer)}&cascade=${cascade}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['maskinportenConsumers'],
    }),
  }),
});

export const {
  useGetMaskinportenSuppliersQuery,
  useGetMaskinportenConsumersQuery,
  useSearchMaskinportenScopesQuery,
  useMaskinportenResourceDelegationCheckQuery,
  useAddMaskinportenResourceMutation,
  useGetMaskinportenResourcesQuery,
  useRemoveMaskinportenResourceMutation,
  useAddMaskinportenSupplierMutation,
  useRemoveMaskinportenSupplierMutation,
  useRemoveMaskinportenConsumerMutation,
} = maskinportenApi;

export const { endpoints, reducerPath, reducer, middleware } = maskinportenApi;

import { createApi } from '@reduxjs/toolkit/query/react';

import { createBaseQuery } from '@/rtk/app/baseQuery';
import type { CompactRole } from '@/dataObjects/dtos/Common';
import type { PartyEntity } from '@/dataObjects/dtos/Party';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import type { AssignmentDto } from './clientApi';
import type {
  DelegationCheckedRight,
  ResourceDelegation,
  ServiceResource,
} from './singleRights/singleRightsApi';

export interface MaskinportenConnection {
  party: PartyEntity;
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

const buildScopeSearchUrl = ({
  searchString,
  ROfilters,
  page,
  resultsPerPage,
}: MaskinportenScopeSearchParams) => {
  const params = new URLSearchParams({
    Page: String(page),
    ResultsPerPage: String(resultsPerPage),
    SearchString: searchString,
  });
  ROfilters.forEach((filter) => params.append('ROFilters', filter));

  return `scopes/search?${params.toString()}`;
};

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/maskinporten`;

export const maskinportenApi = createApi({
  reducerPath: 'maskinportenApi',
  baseQuery: createBaseQuery(baseUrl),
  tagTypes: [
    'maskinportenSuppliers',
    'maskinportenConsumers',
    'maskinportenResourceDelegationCheck',
    'maskinportenSupplierResources',
    'maskinportenConsumerResources',
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
    getMaskinportenConsumers: builder.query<
      MaskinportenConnection[],
      { party?: string; consumer?: string } | void
    >({
      query: (args) => {
        const party = args?.party ?? getCookie('AltinnPartyUuid');
        const base = `consumers?party=${party}`;
        return args?.consumer ? `${base}&consumer=${encodeURIComponent(args.consumer)}` : base;
      },
      providesTags: ['maskinportenConsumers'],
    }),
    searchMaskinportenScopes: builder.query<
      PaginatedMaskinportenScopeSearchResult,
      MaskinportenScopeSearchParams
    >({
      query: buildScopeSearchUrl,
    }),
    /**
     * Same search as `searchMaskinportenScopes`, but pages are accumulated instead of replaced.
     * Use with a "load more" button: `data.pages` holds every page fetched so far for the
     * current search arguments, and changing those arguments starts a fresh cache entry.
     */
    searchMaskinportenScopesPages: builder.infiniteQuery<
      PaginatedMaskinportenScopeSearchResult,
      Omit<MaskinportenScopeSearchParams, 'page'>,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          const loadedCount = allPages.reduce((count, page) => count + page.pageList.length, 0);
          return loadedCount >= lastPage.numEntriesTotal ? undefined : lastPageParam + 1;
        },
      },
      query: ({ queryArg, pageParam }) => buildScopeSearchUrl({ ...queryArg, page: pageParam }),
    }),
    maskinportenResourceDelegationCheck: builder.query<
      MaskinportenResourceDelegationCheckResult,
      { party?: string; resource: string }
    >({
      query: ({ party, resource }) =>
        `suppliers/resources/delegationcheck?party=${party ?? getCookie('AltinnPartyUuid')}&resource=${encodeURIComponent(resource)}`,
      providesTags: ['maskinportenResourceDelegationCheck'],
    }),
    addMaskinportenSupplierResource: builder.mutation<
      boolean,
      { party: string; supplier: string; resource: string }
    >({
      query: ({ party, supplier, resource }) => ({
        url: `suppliers/resources?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}&resource=${encodeURIComponent(resource)}`,
        method: 'POST',
      }),
      invalidatesTags: ['maskinportenResourceDelegationCheck', 'maskinportenSupplierResources'],
    }),
    getMaskinportenSupplierResources: builder.query<
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

        return `suppliers/resources?${params.toString()}`;
      },
      providesTags: ['maskinportenSupplierResources'],
    }),
    removeMaskinportenSupplierResource: builder.mutation<
      void,
      { party: string; supplier: string; resource: string }
    >({
      query: ({ party, supplier, resource }) => ({
        url: `suppliers/resources?party=${encodeURIComponent(party)}&supplier=${encodeURIComponent(supplier)}&resource=${encodeURIComponent(resource)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['maskinportenResourceDelegationCheck', 'maskinportenSupplierResources'],
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
    getMaskinportenConsumerResources: builder.query<
      ResourceDelegation[],
      { party?: string; consumer?: string }
    >({
      query: ({ party, consumer }) => {
        const params = new URLSearchParams({
          party: party ?? getCookie('AltinnPartyUuid'),
        });

        if (consumer) {
          params.append('consumer', consumer);
        }

        return `consumers/resources?${params.toString()}`;
      },
      providesTags: ['maskinportenConsumerResources'],
    }),
    removeMaskinportenConsumerResource: builder.mutation<
      void,
      { party: string; consumer: string; resource: string }
    >({
      query: ({ party, consumer, resource }) => ({
        url: `consumers/resources?party=${encodeURIComponent(party)}&consumer=${encodeURIComponent(consumer)}&resource=${encodeURIComponent(resource)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['maskinportenConsumerResources'],
    }),
  }),
});

export const {
  useGetMaskinportenSuppliersQuery,
  useGetMaskinportenConsumersQuery,
  useSearchMaskinportenScopesQuery,
  useSearchMaskinportenScopesPagesInfiniteQuery,
  useMaskinportenResourceDelegationCheckQuery,
  useLazyMaskinportenResourceDelegationCheckQuery,
  useAddMaskinportenSupplierResourceMutation,
  useGetMaskinportenSupplierResourcesQuery,
  useRemoveMaskinportenSupplierResourceMutation,
  useAddMaskinportenSupplierMutation,
  useRemoveMaskinportenSupplierMutation,
  useRemoveMaskinportenConsumerMutation,
  useGetMaskinportenConsumerResourcesQuery,
  useRemoveMaskinportenConsumerResourceMutation,
} = maskinportenApi;

export const { endpoints, reducerPath, reducer, middleware } = maskinportenApi;

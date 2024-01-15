import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IdValuePair } from '@/dataObjects/dtos/IdValuePair';
import { getCookie } from '@/resources/Cookie/CookieMethods';

interface PaginatedListDTO {
  page: number;
  numEntriesTotal: number;
  pageList: ServiceResource[];
}

export interface ServiceResource {
  title: string;
  identifier: string;
  resourceOwnerName: string;
  rightDescription: string;
  description?: string;
  resourceReferences: resourceReference[];
  authorizationReference: IdValuePair[];
  resourceType: string;
}

export interface ResourceOwner {
  organisationName: string;
  organisationNumber: string;
}

interface resourceReference {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

interface searchParams {
  searchString: string;
  ROfilters: string[];
  page: number;
  resultsPerPage: number;
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const singleRightsApi = createApi({
  reducerPath: 'singleRightsApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers: Headers): Headers => {
      const token = getCookie('XSRF-TOKEN');
      if (typeof token === 'string') {
        headers.set('X-XSRF-TOKEN', token);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPaginatedSearch: builder.query<PaginatedListDTO, searchParams>({
      query: (args) => {
        const { searchString, ROfilters, page, resultsPerPage } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/paginatedSearch?Page=${page}&ResultsPerPage=${resultsPerPage}&SearchString=${searchString}${filterUrl}`;
      },
    }),
    getResourceOwners: builder.query<ResourceOwner[], void>({
      query: () => 'resources/resourceowners',
    }),
  }),
});

export const { useGetPaginatedSearchQuery, useGetResourceOwnersQuery } = singleRightsApi;

export const { endpoints, reducerPath, reducer, middleware } = singleRightsApi;

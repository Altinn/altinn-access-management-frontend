import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ServiceResource {
  title: string;
  identifier: string;
  resourceOwnerName: string;
  rightDescription: string;
  description?: string;
  resourceReferences: resourceReference[];
}

interface paginatedListDTO {
  page: number;
  numEntriesTotal: number;
  pageList: ServiceResource[];
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
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getPaginatedSearch: builder.query<paginatedListDTO, searchParams>({
      query: (args) => {
        const { searchString, ROfilters, page, resultsPerPage } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/paginatedSearch?Page=${page}&ResultsPerPage=${resultsPerPage}&SearchString=${searchString}${filterUrl}`;
      },
    }),
  }),
});

export const { useGetPaginatedSearchQuery } = singleRightsApi;

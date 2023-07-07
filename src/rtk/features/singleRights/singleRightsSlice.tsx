import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface PaginatedListDTO {
  page: number;
  NumEntiresTotal: number;
  pageList: ServiceResource[];
}

export interface ServiceResource {
  title: string;
  identifier: string;
  resourceOwnerName: string;
  rightDescription: string;
  description?: string;
  resourceReferences: resourceReference[];
}

interface resourceReference {
  reference: string;
  referenceType: string;
  referenceSource: string;
}

interface searchParams {
  searchString: string;
  ROfilters: string[];
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const singleRightsApi = createApi({
  reducerPath: 'singleRightsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getPaginatedSearch: builder.query<PaginatedListDTO, searchParams>({
      query: (args) => {
        const { searchString, ROfilters } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/paginatedSearch?Page=1&ResultsPerPage=10&SearchString=${searchString}${filterUrl}`;
      },
    }),
  }),
});

export const { useGetPaginatedSearchQuery } = singleRightsApi;

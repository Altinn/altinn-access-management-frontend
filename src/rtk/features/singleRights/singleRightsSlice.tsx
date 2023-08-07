import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { type DelegationRequestDto } from '@/dataObjects/dtos/CheckDelegationAccessDto';

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
}

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const singleRightsApi = createApi({
  reducerPath: 'singleRightsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getPaginatedSearch: builder.query<PaginatedListDTO, searchParams>({
      query: (args) => {
        const { searchString, ROfilters, page } = args;
        let filterUrl = '';
        for (const filter of ROfilters) {
          filterUrl = filterUrl + `&ROFilters=${filter}`;
        }
        return `resources/paginatedSearch?Page=${page}&ResultsPerPage=10&SearchString=${searchString}${filterUrl}`;
      },
    }),
  }),
});

/* export const delegationAccessCheckApi = createApi({
  reducerPath: 'delegationAccessCheckApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getDelegationAccessCheck: builder.query<DelegationRequestDto>({
      query: (dto: DelegationRequestDto) => {
        return `singleright/checkdelegationaccesses/${1232131234}${dto}`;
      },
    }),
  }),
}); */

export const { useGetPaginatedSearchQuery } = singleRightsApi;

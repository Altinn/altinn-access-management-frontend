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

export interface DelegationAccessCheckResponse {
  rightKey: string;
  resource: IdValuePair[];
  action: string;
  status: string;
  details: Details;
}

export interface IdValuePair {
  id: string;
  value: string;
}

export interface Details {
  detailCode: string;
  info: string;
  detailParams: DetailParams[];
}

export interface DetailParams {
  name: string;
  value: string;
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
    getDelegationAccessCheck: builder.mutation<
      DelegationAccessCheckResponse[],
      DelegationRequestDto
    >({
      query: (dto) => ({
        url: `singleright/checkdelegationaccesses/${1232131234}`,
        method: 'POST',
        body: dto,
      }),
    }),
  }),
});

export const { useGetPaginatedSearchQuery, useGetDelegationAccessCheckMutation } = singleRightsApi;

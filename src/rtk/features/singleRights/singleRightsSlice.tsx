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

const baseUrl = import.meta.env.BASE_URL + 'accessmanagement/api/v1';

export const singleRightsApi = createApi({
  reducerPath: 'singleRightsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getPaginatedSearch: builder.query<PaginatedListDTO, string>({
      query: (searchString: string) =>
        `resources/paginatedSearch?Page=1&ResultsPerPage=10&SearchString=${searchString}`,
    }),
  }),
});

export const { useGetPaginatedSearchQuery } = singleRightsApi;

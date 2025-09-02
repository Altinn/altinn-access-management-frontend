import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { CompactPackage, Permissions } from '@/dataObjects/dtos/accessPackage';

export interface AccessArea {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  accessPackages: AccessPackage[];
}

export interface PackageResource {
  id: string;
  name: string;
  title: string;
  description: string;
  provider: ResourceProvider;
  resourceOwnerName: string;
  resourceOwnerLogoUrl: string;
  resourceOwnerOrgcode: string;
  resourceOwnerOrgNumber: string;
  resourceOwnerType: string;
}

export interface ResourceProvider {
  id: string;
  name: string;
  refId: string;
  logoUrl: string;
  code: string;
  typeId: string;
}

export interface AccessPackage {
  id: string;
  name: string;
  description: string;
  resources: PackageResource[];
  isAssignable: boolean;
  area: AccessArea;
  urn?: string;
  permissions?: Permissions[];
}

export interface AccessPackageDelegation {
  package: CompactPackage;
  permissions: Permissions[];
}

export interface DelegationCheckResponse {
  package: AccessPackage;
  result: boolean;
  reasons: Reason[];
}

export interface Reason {
  description: string;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/accesspackage`;

export const accessPackageApi = createApi({
  reducerPath: 'accessPackageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
      return headers;
    },
  }),
  tagTypes: ['AccessPackages'],
  endpoints: (builder) => ({
    search: builder.query<AccessArea[], string>({
      query: (searchString) => {
        return `search?&searchString=${searchString}`;
      },
    }),
    getUserDelegations: builder.query<
      { [key: string]: AccessPackageDelegation[] },
      { from: string; to: string; party?: string }
    >({
      query: ({ from, to, party = getCookie('AltinnPartyUuid') }) => {
        return `delegations?from=${from}&to=${to}&party=${party}`;
      },
      providesTags: ['AccessPackages'],
      keepUnusedDataFor: 10, // seconds
    }),
    getPackagePermissionDetails: builder.query<
      AccessPackage,
      { from?: string; to?: string; party?: string; packageId: string }
    >({
      query: ({ from, to, party = getCookie('AltinnPartyUuid'), packageId }) => {
        return `permission/${packageId}?from=${from ?? ''}&to=${to ?? ''}&party=${party}`;
      },
      providesTags: ['AccessPackages'],
      keepUnusedDataFor: 100, // seconds
    }),
    revokeDelegation: builder.mutation<
      void,
      { to: string; packageId: string; party?: string; from?: string }
    >({
      query({
        to,
        from = getCookie('AltinnPartyUuid'),
        packageId,
        party = getCookie('AltinnPartyUuid'),
      }) {
        return {
          url: `delegations?party=${party}&to=${to}&from=${from}&packageId=${packageId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AccessPackages'],
    }),
    delegatePackage: builder.mutation<
      void,
      { to: string; packageId: string; party?: string; from?: string }
    >({
      invalidatesTags: ['AccessPackages'],
      query: ({
        to,
        from = getCookie('AltinnPartyUuid'),
        packageId,
        party = getCookie('AltinnPartyUuid'),
      }) => {
        return {
          url: `delegations?party=${party}&to=${to}&from=${from}&packageId=${packageId}`,
          method: 'POST',
        };
      },
    }),
    delegationCheck: builder.query<DelegationCheckResponse[], { party?: string }>({
      query: ({ party = getCookie('AltinnPartyUuid') }) => {
        return {
          url: `delegationcheck?party=${party}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useSearchQuery,
  useGetUserDelegationsQuery,
  useGetPackagePermissionDetailsQuery,
  useRevokeDelegationMutation,
  useDelegatePackageMutation,
  useDelegationCheckQuery,
} = accessPackageApi;

export const { endpoints, reducerPath, reducer, middleware } = accessPackageApi;

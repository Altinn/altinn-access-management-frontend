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
  description: string;
  provider: ResourceProvider;
}

export interface ResourceProvider {
  id: string;
  name: string;
  logoUrl: string;
}

export interface AccessPackage {
  id: string;
  name: string;
  description: string;
  resources: PackageResource[];
  isAssignable: boolean;
  area: AccessArea;
  inherited?: boolean;
}

export interface AccessPackageDelegation {
  package: CompactPackage;
  permissions: Permissions[];
}

export interface DelegationCheckResponse {
  packageId: string;
  canDelegate: boolean;
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
      keepUnusedDataFor: 3, // seconds
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
    delegationCheck: builder.mutation<DelegationCheckResponse[], { packageIds: string[] }>({
      query: ({ packageIds }) => {
        const delegationCheckRequest = {
          packageIds: packageIds,
          reporteeUuid: getCookie('AltinnPartyUuid'),
        };
        return {
          url: `delegationcheck`,
          method: 'POST',
          body: JSON.stringify(delegationCheckRequest),
        };
      },
    }),
  }),
});

export const {
  useSearchQuery,
  useGetUserDelegationsQuery,
  useRevokeDelegationMutation,
  useDelegatePackageMutation,
  useDelegationCheckMutation,
} = accessPackageApi;

export const { endpoints, reducerPath, reducer, middleware } = accessPackageApi;

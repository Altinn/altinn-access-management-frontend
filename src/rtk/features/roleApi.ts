import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import type { ErrorCode } from '@/resources/utils/errorCodeUtils';

export interface ProviderType {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  refId?: string | null;
  logoUrl?: string | null;
  code?: string;
  typeId?: string;
  type?: ProviderType | null;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  urn?: string;
  isKeyRole?: boolean;
  legacyRoleCode?: string | null;
  legacyUrn?: string | null;
  provider?: Provider;
  area?: Area;
  isDelegable?: boolean;
}

interface Area {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
}

export interface AreaFE extends Area {
  roles: Role[];
}

export interface RoleConnection {
  role: Role;
  permissions: Permissions[];
}

interface RoleConnectionsRequest {
  from: string;
  to: string;
  party?: string;
}

interface DelegationCheckResponse {
  detailCode: ErrorCode;
  canDelegate: boolean;
}

const baseUrl = `${import.meta.env.BASE_URL}accessmanagement/api/v1/role`;

export const roleApi = createApi({
  reducerPath: 'roleApi',
  tagTypes: ['roles'],
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
    getRoles: builder.query<AreaFE[], void>({
      query: () => '/search',
      providesTags: ['roles'],
    }),
    getRoleById: builder.query<Role, string>({
      query: (id) => `/${id}`,
    }),
    getRolesForUser: builder.query<RoleConnection[], RoleConnectionsRequest>({
      query: ({ from, to, party = getCookie('AltinnPartyUuid') }) =>
        `/connections?party=${party}&from=${from}&to=${to}`,
      providesTags: ['roles'],
    }),
    revoke: builder.mutation<void, { from: string; to: string; roleId: string; party?: string }>({
      query({ from, to, roleId, party = getCookie('AltinnPartyUuid') }) {
        return {
          url: `/connections?party=${party}&from=${from}&to=${to}&roleId=${roleId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['roles'],
    }),
    delegate: builder.mutation<void, { to: string; roleId: string }>({
      invalidatesTags: ['roles'],
      query: ({ to, roleId }) => {
        const from = getCookie('AltinnPartyUuid');
        return {
          url: `delegate/${from}/${to}/${roleId}`,
          method: 'POST',
        };
      },
    }),
    delegationCheck: builder.query<
      DelegationCheckResponse,
      { rightownerUuid: string; roleUuid: string }
    >({
      query({ rightownerUuid, roleUuid }) {
        return {
          url: `/delegationcheck/${rightownerUuid}/${roleUuid}`,
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useGetRolesForUserQuery,
  useGetRoleByIdQuery,
  useRevokeMutation,
  useDelegateMutation,
  useGetRolesQuery,
  useDelegationCheckQuery,
} = roleApi;

export const { endpoints, reducerPath, reducer, middleware } = roleApi;

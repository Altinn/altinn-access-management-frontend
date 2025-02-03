import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { ErrorCode } from '@/resources/utils/errorCodeUtils';

interface EntityType {
  id: string;
  providerId: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
}

export interface Role {
  entityType: EntityType;
  provider: Provider;
  id: string;
  entityTypeId: string;
  providerId: string;
  name: string;
  code: string;
  description: string;
  urn: string;
  area: Area;
  isDelegable: boolean;
}

export interface ExtendedRole extends Role {
  inherited: Role[];
  assignmentId?: string;
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

export interface Assignment {
  id: string;
  roleId: string;
  fromId: string;
  toId: string;
  role: Role;
  inherited: Role[];
}

interface RoleApiRequest {
  rightOwnerUuid: string;
  rightHolderUuid: string;
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
    getRolesForUser: builder.query<Assignment[], RoleApiRequest>({
      query: ({ rightOwnerUuid, rightHolderUuid }) =>
        `/assignments/${rightOwnerUuid}/${rightHolderUuid}`,
    }),
    revoke: builder.mutation<void, { assignmentId: string }>({
      query({ assignmentId }) {
        return {
          url: `/assignments/${assignmentId}`,
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
  useRevokeMutation,
  useDelegateMutation,
  useGetRolesQuery,
  useDelegationCheckQuery,
} = roleApi;

export const { endpoints, reducerPath, reducer, middleware } = roleApi;

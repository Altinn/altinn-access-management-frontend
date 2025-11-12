import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getCookie } from '@/resources/Cookie/CookieMethods';

interface Provider {
  id: string;
  name: string;
  refId: string;
  logoUrl: string;
  code: string;
  typeId: string;
  type: ProviderType;
}

interface ProviderType {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  isKeyRole: boolean;
  urn: string;
  legacyRoleCode?: string;
  legacyUrn?: string;
  provider: Provider;
}

export interface CompactRole {
  id: string;
  code: string;
  children?: CompactRole[];
}

export interface CompactEntity {
  id: string;
  name: string;
  type: string;
  variant: string;
  parent?: CompactEntity;
  children?: CompactEntity[];
  keyValues?: Record<string, string>;
}

export interface Permission {
  from: CompactEntity;
  to: CompactEntity;
  via?: CompactEntity;
  role?: CompactRole;
  viaRole?: CompactRole;
}

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

interface RoleAreaGroupMetadata {
  id: string;
  name: string;
  urn: string;
  description: string;
  type: string;
}

interface RoleAreaMetadata {
  id: string;
  name: string;
  urn: string;
  description: string;
  iconUrl: string;
  group: RoleAreaGroupMetadata;
}

interface RoleProviderMetadata {
  id: string;
  name: string;
  refId: string;
  logoUrl: string;
  code: string;
  typeId: string;
  type: ProviderType;
}

interface RoleResourceTypeMetadata {
  id: string;
  name: string;
}

export interface RoleResourceMetadata {
  id: string;
  providerId: string;
  typeId: string;
  name: string;
  description: string;
  refId: string;
  provider: RoleProviderMetadata;
  type: RoleResourceTypeMetadata;
}

export interface RolePackageMetadata {
  id: string;
  name: string;
  urn: string;
  description: string;
  isDelegable: boolean;
  isAssignable: boolean;
  isResourcePolicyAvailable: boolean;
  area: RoleAreaMetadata;
  resources: RoleResourceMetadata[];
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
    getConnections: builder.query<RolePermission[], { party: string; from?: string; to?: string }>({
      query: ({ party, from, to }) => {
        const params = new URLSearchParams({ party });
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        return `/connections?${params.toString()}`;
      },
      providesTags: ['roles'],
    }),
    getRoleById: builder.query<Role, string>({
      query: (id) => `/${id}`,
    }),
    getRolePackages: builder.query<
      RolePackageMetadata[],
      { roleId: string; variant?: string; includeResources?: boolean }
    >({
      query: ({ roleId, variant, includeResources = false }) => {
        const params = new URLSearchParams({
          includeResources: includeResources.toString(),
        });
        if (variant) params.append('variant', variant);
        return `/${roleId}/packages?${params.toString()}`;
      },
    }),
    getRoleResources: builder.query<
      RoleResourceMetadata[],
      { roleId: string; variant?: string; includePackageResources?: boolean }
    >({
      query: ({ roleId, variant, includePackageResources = false }) => {
        const params = new URLSearchParams({
          includePackageResources: includePackageResources.toString(),
        });
        if (variant) params.append('variant', variant);
        return `/${roleId}/resources?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetConnectionsQuery,
  useGetRoleByIdQuery,
  useGetRolePackagesQuery,
  useGetRoleResourcesQuery,
} = roleApi;

export const { endpoints, reducerPath, reducer, middleware } = roleApi;

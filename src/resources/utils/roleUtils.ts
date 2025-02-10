import type { Assignment } from '@/rtk/features/roleApi';

export const filterDigdirAssignments = (assignments: Assignment[] = []) =>
  assignments?.filter((a) => a.role.urn?.includes('digdir:')) || [];

export const filterDigdirRole = (roleUrns: string[] = []) =>
  roleUrns?.filter((urn) => urn?.includes('digdir:')) || [];

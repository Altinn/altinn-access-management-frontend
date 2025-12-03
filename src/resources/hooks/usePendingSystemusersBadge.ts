import { getCookie } from '@/resources/Cookie/CookieMethods';
import { hasCreateSystemUserPermission } from '../utils/permissionUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { BadgeProps } from '@altinn/altinn-components';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';

export const usePendingSystemusersBadge = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: reporteeData } = useGetReporteeQuery();
  const { data: pendingSystemUsers } = useGetPendingSystemUserRequestsQuery(partyUuid, {
    skip: !hasCreateSystemUserPermission(reporteeData),
  });

  const systemuserBadge: BadgeProps | undefined = pendingSystemUsers?.length
    ? {
        label: pendingSystemUsers.length,
        color: 'danger',
        variant: 'base',
      }
    : undefined;

  return { systemuserBadge };
};

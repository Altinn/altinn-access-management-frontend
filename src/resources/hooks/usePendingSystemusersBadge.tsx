import { ReactElement } from 'react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { hasCreateSystemUserPermission } from '../utils/permissionUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { BadgeProps, DsSpinner } from '@altinn/altinn-components';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';

export const usePendingSystemusersBadge = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: reporteeData } = useGetReporteeQuery();
  const { data: pendingSystemUsers, isLoading: isLoadingPendingSystemUsers } =
    useGetPendingSystemUserRequestsQuery(partyUuid, {
      skip: !hasCreateSystemUserPermission(reporteeData),
    });

  let systemuserBadge: BadgeProps | ReactElement | undefined = undefined;
  if (isLoadingPendingSystemUsers) {
    systemuserBadge = (
      <DsSpinner
        data-size='xs'
        aria-label='laster'
      />
    );
  } else if (pendingSystemUsers?.length) {
    systemuserBadge = {
      label: pendingSystemUsers.length,
      color: 'danger',
      variant: 'base',
    };
  }

  return { systemuserBadge };
};

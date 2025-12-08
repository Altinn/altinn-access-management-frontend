import { ReactElement } from 'react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { hasCreateSystemUserPermission } from '../utils/permissionUtils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { BadgeProps, DsSpinner } from '@altinn/altinn-components';
import { useGetPendingSystemUserRequestsQuery } from '@/rtk/features/systemUserApi';
import { useTranslation } from 'react-i18next';

export const usePendingSystemusersBadge = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { t } = useTranslation();
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
        aria-label={t('systemuser_overviewpage.loading_systemusers')}
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

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { hasConsentPermission } from '../utils/permissionUtils';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { BadgeProps } from '@altinn/altinn-components';

export const usePendingConsentsBadge = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: reportee } = useGetReporteeQuery();
  const { data: isAdmin } = useGetIsAdminQuery();
  const hasPermissionToAcceptConsent = hasConsentPermission(reportee, isAdmin);
  const { data: activeConsents } = useGetActiveConsentsQuery(
    { partyId: partyUuid },
    { skip: !partyUuid || !hasPermissionToAcceptConsent },
  );

  const pendingConsentsCount = activeConsents?.filter((consent) => consent.isPendingConsent);
  const consentBadge: BadgeProps | undefined = pendingConsentsCount?.length
    ? {
        label: pendingConsentsCount.length,
        color: 'danger',
        variant: 'base',
      }
    : undefined;

  return { consentBadge };
};

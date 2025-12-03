import { ReactElement } from 'react';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { hasConsentPermission } from '../utils/permissionUtils';
import { useGetIsAdminQuery, useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { BadgeProps, DsSpinner } from '@altinn/altinn-components';

export const usePendingConsentsBadge = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: reportee } = useGetReporteeQuery();
  const { data: isAdmin } = useGetIsAdminQuery();
  const hasPermissionToAcceptConsent = hasConsentPermission(reportee, isAdmin);
  const { data: activeConsents, isLoading: isLoadingPendingConsents } = useGetActiveConsentsQuery(
    { partyId: partyUuid },
    { skip: !partyUuid || !hasPermissionToAcceptConsent },
  );
  const pendingConsentsCount = activeConsents?.filter((consent) => consent.isPendingConsent);

  let consentBadge: BadgeProps | ReactElement | undefined = undefined;
  if (isLoadingPendingConsents) {
    consentBadge = (
      <DsSpinner
        data-size='xs'
        aria-label='laster'
      />
    );
  } else if (pendingConsentsCount?.length) {
    consentBadge = {
      label: pendingConsentsCount.length,
      color: 'danger',
      variant: 'base',
    };
  }

  return { consentBadge };
};

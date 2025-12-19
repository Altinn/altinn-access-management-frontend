import React from 'react';
import { getCookie } from '../Cookie/CookieMethods';
import { useGetIsAdminQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission } from '../utils/permissionUtils';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';

export const useRequests = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();

  const hasPermission = hasConsentPermission(isAdmin);
  const { data: activeConsents, isLoading: isLoadingActiveConsents } = useGetActiveConsentsQuery(
    { partyId: partyUuid },
    { skip: !partyUuid || !hasPermission },
  );

  const pendingConsents = activeConsents?.filter((x) => x.isPendingConsent);

  return {
    pendingConsents,
    isLoadingRequests: isLoadingIsAdmin || isLoadingActiveConsents,
  };
};

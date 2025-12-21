import React, { useMemo } from 'react';
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

  const pendingConsents = useMemo(() => {
    return activeConsents
      ?.filter((x) => x.isPendingConsent)
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [activeConsents]);

  return {
    pendingConsents,
    isLoadingRequests: isLoadingIsAdmin || isLoadingActiveConsents,
  };
};

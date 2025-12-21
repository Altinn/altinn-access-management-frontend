import React, { useMemo } from 'react';
import { getCookie } from '../Cookie/CookieMethods';
import { useGetIsAdminQuery } from '@/rtk/features/userInfoApi';
import { hasConsentPermission } from '../utils/permissionUtils';
import { useGetActiveConsentsQuery } from '@/rtk/features/consentApi';
import { Request } from '@/features/amUI/requestPage/types';

export const useRequests = () => {
  const partyUuid = getCookie('AltinnPartyUuid');

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();

  const hasPermission = hasConsentPermission(isAdmin);
  const { data: activeConsents, isLoading: isLoadingActiveConsents } = useGetActiveConsentsQuery(
    { partyId: partyUuid },
    { skip: !partyUuid || !hasPermission },
  );

  const pendingRequests: Request[] = useMemo(() => {
    const consents = (activeConsents || [])
      .filter((x) => x.isPendingConsent)
      .map<Request>((consent) => ({
        id: consent.id,
        type: 'consent',
        createdDate: consent.createdDate,
        fromPartyName: consent.fromParty.name,
        fromPartyType: consent.fromParty.type === 'Person' ? 'person' : 'company',
        description: consent.isPoa ? 'request_page.request_poa' : 'request_page.request_consent',
      }));
    return consents.sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
  }, [activeConsents]);

  return {
    pendingRequests,
    isLoadingRequests: isLoadingIsAdmin || isLoadingActiveConsents,
  };
};

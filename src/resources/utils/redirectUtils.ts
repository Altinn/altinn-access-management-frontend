import { GeneralPath } from '@/routes/paths';

import { getCookie } from '../Cookie/CookieMethods';

export const getRedirectToServicesAvailableForUserUrl = (userID: string, partyID: string) => {
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return `https://${cleanHostname}/${GeneralPath.Profile}?R=${getCookie('AltinnPartyId')}&lm=${encodeURIComponent(`/ui/AccessManagement/ServicesAvailableForActor/?userID=${userID ? userID : 0}&partyID=${partyID}`)}`;
};

export const redirectToSevicesAvailableForUser = (userID: string, partyID: string) => {
  window.location.href = getRedirectToServicesAvailableForUserUrl(userID, partyID);
};

export const getRedirectToProfileUrl = () => {
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return (
    'https://' + cleanHostname + '/' + GeneralPath.Profile + '?R=' + getCookie('AltinnPartyId')
  );
};

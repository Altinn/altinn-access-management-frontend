import { GeneralPath } from '@/routes/paths';

import { getCookie } from '../Cookie/CookieMethods';

export const getRedirectToServicesAvailableForUserUrl = (userID: string, partyID: string) => {
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return `https://${cleanHostname}/${GeneralPath.Profile}?R=${getCookie('AltinnPartyId')}&lm=${encodeURIComponent(`/ui/AccessManagement/ServicesAvailableForActor/?userID=${userID ? userID : 0}&partyID=${partyID}`)}&section=8`;
};

export const getRedirectToA2UsersListSectionUrl = (section: number) => {
  const scrollToId = section === 9 ? 'othersWithRightsHeader' : 'rightGiversHeader';
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return `https://${cleanHostname}/${GeneralPath.Profile}?P=${getCookie('AltinnPartyUuid')}&Section=${section}#${scrollToId}`;
};

export const redirectToSevicesAvailableForUser = (userID: string, partyID: string) => {
  window.location.href = getRedirectToServicesAvailableForUserUrl(userID, partyID);
};

export const redirectToA2ProfileSection = (section: number) => {
  window.location.href = getRedirectToA2UsersListSectionUrl(section);
};

export const getRedirectToProfileUrl = () => {
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return (
    'https://' + cleanHostname + '/' + GeneralPath.Profile + '?R=' + getCookie('AltinnPartyId')
  );
};

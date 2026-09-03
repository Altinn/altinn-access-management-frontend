import { getCookie } from '../Cookie/CookieMethods';

import { GeneralPath } from '@/routes/paths';

export const getRedirectToA2UsersListSectionUrl = (section: number) => {
  const scrollToId = section === 9 ? 'othersWithRightsHeader' : 'rightGiversHeader';
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return `https://${cleanHostname}/${GeneralPath.Profile}?P=${getCookie('AltinnPartyUuid')}&Section=${section}#${scrollToId}`;
};

export const getRedirectToProfileUrl = () => {
  const cleanHostname = window.location.hostname.replace('am.ui.', '');
  return (
    'https://' + cleanHostname + '/' + GeneralPath.Profile + '?R=' + getCookie('AltinnPartyId')
  );
};

export enum ConsentPath {
  Consent = 'consent',
  Request = 'request',
  Active = 'active',
  Log = 'log',
}

export const getConsentRequestUrl = (requestId: string, backToPage: string) => {
  return `/${ConsentPath.Consent}/${ConsentPath.Request}?id=${requestId}&skiplogout=true&backtopage=${backToPage}`;
};

import { GeneralPath } from '@/routes/paths';

import { getAmBaseUrl } from './pathUtils';

export const getDefaultChangeReporteeRedirectTarget = () =>
  new URL(`${window.location.origin}${GeneralPath.BasePath}`).toString();

export const getChangeReporteeAndRedirectUrl = (
  accountUuid: string,
  goTo = getDefaultChangeReporteeRedirectTarget(),
) => {
  const changeUrl = new URL(`${getAmBaseUrl()}api/v1/reportee/changeandredirect/`);
  changeUrl.searchParams.set('partyUuid', accountUuid);
  changeUrl.searchParams.set('goTo', goTo);

  return changeUrl.toString();
};

export const redirectToChangeReporteeAndRedirect = (
  accountUuid: string,
  goTo = getDefaultChangeReporteeRedirectTarget(),
) => {
  (window as Window).open(getChangeReporteeAndRedirectUrl(accountUuid, goTo), '_self');
};

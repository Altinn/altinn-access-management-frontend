import { GeneralPath } from '@/routes/paths';

import { getHostUrl } from './pathUtils';

export const getDefaultChangeReporteeRedirectTarget = () =>
  new URL(`${window.location.origin}${GeneralPath.BasePath}`).toString();

export const getChangeReporteeAndRedirectUrl = (
  accountUuid: string,
  goTo = getDefaultChangeReporteeRedirectTarget(),
) => {
  const changeUrl = new URL(`${getHostUrl()}ui/Reportee/ChangeReporteeAndRedirect/`);
  changeUrl.searchParams.set('P', accountUuid);
  changeUrl.searchParams.set('goTo', goTo);

  return changeUrl.toString();
};

export const redirectToChangeReporteeAndRedirect = (
  accountUuid: string,
  goTo = getDefaultChangeReporteeRedirectTarget(),
) => {
  (window as Window).open(getChangeReporteeAndRedirectUrl(accountUuid, goTo), '_self');
};

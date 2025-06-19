export const getLogoutUrl = (): string => {
  const hostUrl = window.location.hostname.replace('am.ui.', '');
  return `https://${hostUrl}/ui/Authentication/Logout`;
};

export const getApiBaseUrl = (): string => {
  return `${import.meta.env.BASE_URL}accessmanagement/api/v1/systemuser`;
};

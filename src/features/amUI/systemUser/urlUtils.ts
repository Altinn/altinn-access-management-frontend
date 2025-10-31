import { useNewLogoutUrl } from '@/resources/utils/featureFlagUtils';
import { getHostUrl, getPlatformUrl } from '@/resources/utils/pathUtils';

export const getLogoutUrl = (): string => {
  const useNewLogoutUrlFlag = useNewLogoutUrl();
  return useNewLogoutUrlFlag
    ? `${getPlatformUrl()}authentication/api/v1/logout`
    : `${getHostUrl()}ui/Authentication/Logout?languageID=1044`;
};

export const getApiBaseUrl = (): string => {
  return `${import.meta.env.BASE_URL}accessmanagement/api/v1/systemuser`;
};

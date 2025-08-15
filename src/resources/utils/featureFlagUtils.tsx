import { useNavigate } from 'react-router';

export const rerouteIfNotConfetti = () => {
  const navigate = useNavigate();
  if (window.featureFlags.displayConfettiPackage === false) {
    navigate('/not-found');
  }
};

export const rerouteIfLimitedPreview = () => {
  const navigate = useNavigate();
  if (window.featureFlags.displayLimitedPreviewLaunch === true) {
    navigate('/not-found');
  }
};

export const availableForUserTypeCheck = (userType?: string) => {
  if ((userType && userType === 'Organization') || window.featureFlags?.restrictPrivUse === false) {
    return true;
  }
  return false;
};

import { useNavigate } from 'react-router';

export const rerouteIfNotConfetti = () => {
  const navigate = useNavigate();
  if (window.featureFlags.displayConfettiPackage === false) {
    navigate('/not-found');
  }
};

export const rerouteIfNotLimitedPreview = () => {
  const navigate = useNavigate();
  if (window.featureFlags.displayLimitedPreviewLaunch === false) {
    navigate('/not-found');
  }
};

export const availableForUserTypeCheck = (userType?: string) => {
  if ((userType && userType === 'Organization') || window.featureFlags?.restrictPrivUse === false) {
    return true;
  }
  return false;
};

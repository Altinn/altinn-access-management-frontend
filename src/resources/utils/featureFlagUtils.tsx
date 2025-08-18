import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export const rerouteIfNotConfetti = () => {
  const navigate = useNavigate();
  if (window.featureFlags.displayConfettiPackage === false) {
    navigate('/not-found');
  }
};

export const useRerouteIfLimitedPreview = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.featureFlags?.displayLimitedPreviewLaunch === true) {
      navigate('/not-found');
    }
  }, [navigate]);
};

export const availableForUserTypeCheck = (userType?: string) => {
  if ((userType && userType === 'Organization') || window.featureFlags?.restrictPrivUse === false) {
    return true;
  }
  return false;
};

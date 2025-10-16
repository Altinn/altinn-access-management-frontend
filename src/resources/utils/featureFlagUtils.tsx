import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export const useRerouteIfNotConfetti = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.featureFlags?.displayConfettiPackage === false) {
      navigate('/not-found', { replace: true });
    }
  }, [navigate]);
};

export const useRerouteIfLimitedPreview = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.featureFlags?.displayLimitedPreviewLaunch === true) {
      navigate('/not-found', { replace: true });
    }
  }, [navigate]);
};

export const availableForUserTypeCheck = (userType?: string) => {
  if ((userType && userType === 'Organization') || window.featureFlags?.restrictPrivUse === false) {
    return true;
  }
  return false;
};

export const crossPlatformLinksEnabled = () => {
  return window.featureFlags?.crossPlatformLinks === true;
};

export const useNewActorList = () => {
  return window.featureFlags?.useNewActorsList === true;
};

import { PartyType } from '@/rtk/features/userInfoApi';
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
  if (
    (userType && (userType === 'Organization' || userType === PartyType.Organization.toString())) ||
    window.featureFlags?.restrictPrivUse === false
  ) {
    return true;
  }
  return false;
};

export const crossPlatformLinksEnabled = () => {
  return window.featureFlags?.crossPlatformLinks === true;
};

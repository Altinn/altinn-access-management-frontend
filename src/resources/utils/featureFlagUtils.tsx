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

export const useRerouteIfSettingsPageDisabled = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.featureFlags?.displaySettingsPage === false) {
      navigate('/not-found', { replace: true });
    }
  }, [navigate]);
};

export const useRerouteIfPoaOverviewPageDisabled = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.featureFlags?.displayPoaOverviewPage === false) {
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

export const settingsPageEnabled = () => {
  return window.featureFlags?.displaySettingsPage === true;
};

export const poaOverviewPageEnabled = () => {
  return window.featureFlags?.displayPoaOverviewPage === true;
};

export const requestDelegationEnabled = () => {
  return window.featureFlags?.requestDelegationEnabled === true;
};

export const revokeRolesEnabled = () => {
  return window.featureFlags?.revokeRolesEnabled === true;
};

export const useNewActorList = () => {
  return window.featureFlags?.useNewActorsList === true;
};

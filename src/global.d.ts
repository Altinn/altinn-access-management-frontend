export {};

declare global {
  interface Window {
    featureFlags: {
      displayPopularSingleRightsServices: boolean;
      displayResourceDelegation: boolean;
      displayConfettiPackage: boolean;
      displayLimitedPreviewLaunch: boolean;
      displayConsentGui: boolean;
      restrictPrivUse: boolean;
      crossPlatformLinks: boolean;
      useNewActorsList: boolean;
    };
  }
}

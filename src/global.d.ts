export {};

declare global {
  interface Window {
    featureFlags: {
      displayPopularSingleRightsServices: boolean;
      displayResourceDelegation: boolean;
      displayConfettiPackage: boolean;
      displayLimitedPreviewLaunch: boolean;
      restrictPrivUse: boolean;
    };
  }
}

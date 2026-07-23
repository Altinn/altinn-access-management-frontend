export {};

declare global {
  interface Window {
    featureFlags: {
      displayPopularSingleRightsServices: boolean;
      useNewSingleRightsClientDelegation: boolean;
      showIdPortenAuthorizations: boolean;
    };
  }
}

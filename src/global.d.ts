export {};

declare global {
  interface Window {
    featureFlags: {
      displayPopularSingleRightsServices: boolean;
      useNewSingleRightsClientDelegation: boolean;
      showHandledRequests: boolean;
      showIdPortenAuthorizations: boolean;
    };
  }
}

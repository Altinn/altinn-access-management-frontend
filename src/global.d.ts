export {};

declare global {
  interface Window {
    featureFlags: {
      useNewSingleRightsClientDelegation: boolean;
      showHandledRequests: boolean;
      showIdPortenAuthorizations: boolean;
      enableSkyra: boolean;
      enableSingleRightsTabInPoaOverview: boolean;
      enableActivityLog: boolean;
      showSettingsPageServiceAnnouncement: boolean;
    };
  }
}

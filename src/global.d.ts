export {};

declare global {
  interface Window {
    featureFlags: {
      showHandledRequests: boolean;
      showIdPortenAuthorizations: boolean;
      enableSkyra: boolean;
      enableSingleRightsTabInPoaOverview: boolean;
      enableActivityLog: boolean;
      showSettingsPageServiceAnnouncement: boolean;
      showRolesRemovedAlert: boolean;
      enableBankruptcyEstateAdministration: boolean;
      showSystemUsersAsRightHolders: boolean;
    };
  }
}

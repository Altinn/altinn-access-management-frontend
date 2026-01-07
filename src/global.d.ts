export {};

declare global {
  interface Window {
    featureFlags: {
      displayPopularSingleRightsServices: boolean;
      displayResourceDelegation: boolean;
      displayConfettiPackage: boolean;
      restrictPrivUse: boolean;
      crossPlatformLinks: boolean;
      displaySettingsPage: boolean;
      displayClientAdministrationPage: boolean;
      displayPoaOverviewPage: boolean;
      useNewActorsList: boolean;
      displayRequestsPage: boolean;
      displayPrivDelegation: boolean;
      displayAccessRequest: boolean;
      displaySubConnections: boolean;
      displayRoles: boolean;
    };
  }
}

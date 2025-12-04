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
      displayPoaOverviewPage: boolean;
      useNewActorsList: boolean;
      useNewHeader: boolean;
      displayRequestsPage: boolean;
      displayPrivDelegation: boolean;
      displayAccessRequest: boolean;
      displaySubConnections: boolean;
      displayRoles: boolean;
    };
  }
}

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
      displayDeletedAccountToggle: boolean;
      displayPrivDelegation: boolean;
      displayInstanceDelegation: boolean;
      displayAccessRequest: boolean;
      displaySubConnections: boolean;
      displayRoles: boolean;
      addAllSystemuserCustomers: boolean;
      enableAddSelfToSystemuser: boolean;
      enableRequestAccess: boolean;
    };
  }
}

export {};

declare global {
  interface Window {
    featureFlags: {
      displayPopularSingleRightsServices: boolean;
      addAltinn2Account: boolean;
    };
  }
}

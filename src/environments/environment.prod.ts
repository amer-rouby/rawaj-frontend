export const environment = {
  production: true,
  // See environment.ts - same reasoning, this file just isn't currently
  // wired up via angular.json fileReplacements (both configs read from
  // environment.ts), kept in sync here in case that changes later.
  apiUrl: `${window.location.origin}/api`,
  appVersion: '1.0.0',
  appName: 'رواج - كمبيوتر وموبايل',
  brand: 'techShop',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'currentUser'
};

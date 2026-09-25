export const environment = {
  production: true,
  // Not currently wired via angular.json fileReplacements, kept in sync with
  // environment.ts anyway - see that file for why this can't be hardcoded.
  apiUrl: `${window.location.origin}/api`,
  appVersion: '1.0.0',
  appName: 'سوبر ماركت رواج',
  brand: 'supermarket',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'currentUser'
};

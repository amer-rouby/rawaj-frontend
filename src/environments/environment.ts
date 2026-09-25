export const environment = {
  production: false,
  // The frontend is always served from the same origin as its own backend
  // (bundled together in one jar, whatever port that instance runs on -
  // 8092/8093/8094/... across deployments), so this must resolve at
  // runtime rather than hardcode one port. `ng serve` still works via the
  // dev proxy in proxy.conf.json, which forwards /api to a local backend.
  apiUrl: `${window.location.origin}/api`,
  appVersion: '1.0.1',
  appName: 'رواج - كمبيوتر وموبايل',
  brand: 'techShop',
  tokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  userKey: 'currentUser'
};

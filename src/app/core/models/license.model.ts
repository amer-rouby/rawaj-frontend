export interface LicenseStatus {
  expired: boolean;
  // Null when the store has never been licensed yet (unlimited/not activated).
  expiresAt: string | null;
}

export interface LicenseStatus {
  expired: boolean;
  // Null when the store has never been licensed yet (unlimited/not activated).
  expiresAt: string | null;
}

export interface GeneratedLicenseCode {
  code: string;
  licenseKey: string;
  expiresAt: string;
}

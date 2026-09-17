export interface LicenseStatus {
  expired: boolean;
  // Null when the store has never been licensed yet (unlimited/not activated).
  expiresAt: string | null;
  // The store's own activation key - shown to the admin so they can send it
  // to the vendor when requesting a renewal code.
  licenseKey: string | null;
}

export interface GeneratedLicenseCode {
  code: string;
  licenseKey: string;
  expiresAt: string;
}

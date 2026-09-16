export interface RawajFeatureSettings {
  id: number;
  storeId: number;
  stockPredictionEnabled: boolean;
  reorderRecommendationsEnabled: boolean;
  pricingRecommendationsEnabled: boolean;
  supplierRecommendationsEnabled: boolean;
  dashboardInsightsEnabled: boolean;
  dailyBriefEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  realtimeUpdatesEnabled: boolean;
  voiceSearchEnabled: boolean;
  customerCreditEnabled: boolean;
  aiAssistantEnabled: boolean;
  eInvoiceEnabled: boolean;
  offlineModeEnabled: boolean;
  emailEnabled: boolean;
  updatedAt?: string;
}

export type RawajFeatureSettingsRequest = Partial<Omit<RawajFeatureSettings, 'id' | 'storeId' | 'updatedAt'>>;

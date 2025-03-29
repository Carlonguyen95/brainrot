// This configuration would typically be loaded from environment variables
// or a server-side configuration system

// Set this to true to use Google Ads, false to use custom ads
export const USE_GOOGLE_ADS = false

// Set this to true when Google Ads are properly set up and ready to display
export const GOOGLE_ADS_LOADED = false

// This could be expanded to include more configuration options
// such as specific ad slots, sizes, etc.
export const AD_CONFIG = {
  useGoogleAds: USE_GOOGLE_ADS,
  googleAdsLoaded: GOOGLE_ADS_LOADED,
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX", // Replace with your actual AdSense publisher ID
  adSlots: {
    banner: "1234567890",
    rectangle: "2345678901",
    vertical: "3456789012",
  },
}


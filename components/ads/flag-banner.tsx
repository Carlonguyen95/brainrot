import Link from "next/link"
import { Card } from "@/components/ui/card"
import GoogleAd from "./google-ad"
import { AD_CONFIG } from "@/lib/ad-config"

interface FlagBannerProps {
  useGoogleAds?: boolean
}

export default function FlagBanner({ useGoogleAds = false }: FlagBannerProps) {
  // If Google Ads are enabled but not loaded, don't show anything
  if (useGoogleAds && !AD_CONFIG.googleAdsLoaded) {
    return null
  }

  if (useGoogleAds) {
    return (
      <div className="mb-6">
        <GoogleAd
          slot="1234567890" // Replace with your actual ad slot ID
          format="horizontal"
          style={{ minHeight: "90px" }}
        />
      </div>
    )
  }

  return (
    <div className="mb-6">
      <Link href="/advertise" className="block">
        <Card className="overflow-hidden border-2 border-yellow-400 hover:border-yellow-500 transition-colors">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-3 text-center">
            <p className="text-sm font-medium text-yellow-800">
              <span className="font-bold">SPONSORED:</span> Want to advertise on Brain Rot Dictionary? Click here to
              learn more!
            </p>
          </div>
        </Card>
      </Link>
    </div>
  )
}


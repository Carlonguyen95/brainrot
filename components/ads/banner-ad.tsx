import Link from "next/link"
import { Card } from "@/components/ui/card"
import GoogleAd from "./google-ad"
import { AD_CONFIG } from "@/lib/ad-config"

interface BannerAdProps {
  index?: number
  useGoogleAds?: boolean
}

export default function BannerAd({ index = 0, useGoogleAds = false }: BannerAdProps) {
  // If Google Ads are enabled but not loaded, don't show anything
  if (useGoogleAds && !AD_CONFIG.googleAdsLoaded) {
    return null
  }

  if (useGoogleAds) {
    return (
      <div className="w-full my-6">
        <GoogleAd
          slot="2345678901" // Replace with your actual ad slot ID
          format="rectangle"
          style={{ minHeight: "250px" }}
        />
      </div>
    )
  }

  // Different ad content based on index for variety
  const adContent = [
    {
      title: "Get Your Brain Rot Merch!",
      description: "T-shirts, hoodies, and mugs with your favorite slang terms",
      cta: "Shop Now",
      link: "/store",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
      textColor: "text-blue-800",
    },
    {
      title: "Advertise Your Brand Here",
      description: "Reach millions of Gen Z users daily",
      cta: "Learn More",
      link: "/advertise",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-300",
      textColor: "text-purple-800",
    },
    {
      title: "Create Your Own Brain Rot Memes",
      description: "Try our free meme generator",
      cta: "Create Now",
      link: "/meme-generator",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      textColor: "text-green-800",
    },
  ]

  const ad = adContent[index % adContent.length]

  return (
    <div className="w-full my-6">
      <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Advertisement</div>
      <Link href={ad.link}>
        <Card className={`overflow-hidden border-2 ${ad.borderColor} hover:shadow-md transition-all`}>
          <div className={`${ad.bgColor} p-4 text-center`}>
            <h3 className={`font-bold text-lg ${ad.textColor}`}>{ad.title}</h3>
            <p className={`text-sm ${ad.textColor} mb-2`}>{ad.description}</p>
            <button className="bg-white px-4 py-1 rounded-full text-sm font-medium shadow-sm hover:shadow transition-shadow">
              {ad.cta}
            </button>
          </div>
        </Card>
      </Link>
    </div>
  )
}


import Link from "next/link"
import { getDailyMetrics, getAdPerformance } from "@/lib/actions/metrics-actions"
import { getAdConfig } from "@/lib/actions/ad-config-actions"
import { getCustomAds } from "@/lib/actions/custom-ad-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Users, ImageIcon, ArrowUpRight } from "lucide-react"

export default async function AdminDashboard() {
  // Fetch metrics and data
  const metrics = await getDailyMetrics(7) // Last 7 days
  const adPerformance = await getAdPerformance()
  const adConfig = await getAdConfig()
  const customAds = await getCustomAds()

  // Calculate totals
  const totalImpressions = metrics.reduce((sum, day) => sum + day.impressions, 0)
  const totalClicks = metrics.reduce((sum, day) => sum + day.clicks, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const activeAds = customAds.filter((ad) => ad.active).length

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Impressions (7 days)</CardDescription>
            <CardTitle className="text-3xl">{totalImpressions.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clicks (7 days)</CardDescription>
            <CardTitle className="text-3xl">{totalClicks.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average CTR</CardDescription>
            <CardTitle className="text-3xl">{avgCTR.toFixed(2)}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Custom Ads</CardDescription>
            <CardTitle className="text-3xl">{activeAds}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Ad Configuration Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ad Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Google Ads</p>
                <p className="text-sm text-gray-500">{adConfig?.use_google_ads ? "Enabled" : "Disabled"}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  adConfig?.use_google_ads ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {adConfig?.use_google_ads ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Google Ads Loaded</p>
                <p className="text-sm text-gray-500">
                  {adConfig?.google_ads_loaded ? "Ready to display" : "Not ready"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  adConfig?.google_ads_loaded ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {adConfig?.google_ads_loaded ? "Ready" : "Not Ready"}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Custom Ads</p>
                <p className="text-sm text-gray-500">{!adConfig?.use_google_ads ? "Active" : "Inactive"}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  !adConfig?.use_google_ads ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {!adConfig?.use_google_ads ? "In Use" : "Not In Use"}
              </div>
            </div>

            <div className="mt-6">
              <Link href="/admin/ads" className="text-blue-600 hover:text-blue-800 flex items-center">
                Manage Ad Configuration
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Ads */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Performing Ads</CardTitle>
        </CardHeader>
        <CardContent>
          {adPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Ad Title</th>
                    <th className="text-right py-3 px-4">Impressions</th>
                    <th className="text-right py-3 px-4">Clicks</th>
                    <th className="text-right py-3 px-4">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {adPerformance.slice(0, 5).map((ad) => (
                    <tr key={ad.id} className="border-b">
                      <td className="py-3 px-4">{ad.title}</td>
                      <td className="text-right py-3 px-4">{ad.impressions.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{ad.clicks.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{ad.ctr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No ad performance data available yet.</p>
          )}

          <div className="mt-6">
            <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-800 flex items-center">
              View All Analytics
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              Custom Ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage your custom ad content and campaigns.</p>
            <Link href="/admin/ads/custom" className="text-blue-600 hover:text-blue-800 flex items-center">
              Manage Custom Ads
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Ad Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Configure ad slots and placement settings.</p>
            <Link href="/admin/ads/slots" className="text-blue-600 hover:text-blue-800 flex items-center">
              Manage Ad Slots
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Manage admin access and permissions.</p>
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 flex items-center">
              Manage Admin Users
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


import { getDailyMetrics, getAdPerformance } from "@/lib/actions/metrics-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AnalyticsPage() {
  const metrics = await getDailyMetrics(30) // Last 30 days
  const adPerformance = await getAdPerformance()

  // Calculate totals
  const totalImpressions = metrics.reduce((sum, day) => sum + day.impressions, 0)
  const totalClicks = metrics.reduce((sum, day) => sum + day.clicks, 0)
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalImpressions.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgCTR.toFixed(2)}%</p>
            <p className="text-sm text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily metrics table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Impressions</th>
                    <th className="text-right py-3 px-4">Clicks</th>
                    <th className="text-right py-3 px-4">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((day) => (
                    <tr key={day.date} className="border-b">
                      <td className="py-3 px-4">{new Date(day.date).toLocaleDateString()}</td>
                      <td className="text-right py-3 px-4">{day.impressions.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{day.clicks.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{day.ctr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No metrics data available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Ad performance table */}
      <Card>
        <CardHeader>
          <CardTitle>Ad Performance</CardTitle>
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
                  {adPerformance.map((ad) => (
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
            <p className="text-gray-500 text-center py-8">No ad performance data available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


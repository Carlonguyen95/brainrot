import Link from "next/link"
import { getCustomAds } from "@/lib/actions/custom-ad-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit } from "lucide-react"
import DeleteCustomAdButton from "./delete-button"

export default async function CustomAdsPage() {
  const customAds = await getCustomAds()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Custom Ads</h1>
        <Link href="/admin/ads/custom/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Ad
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Custom Ads</CardTitle>
        </CardHeader>
        <CardContent>
          {customAds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Position</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Priority</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customAds.map((ad) => (
                    <tr key={ad.id} className="border-b">
                      <td className="py-3 px-4">{ad.title}</td>
                      <td className="py-3 px-4">{ad.position}</td>
                      <td className="py-3 px-4">
                        <Badge variant={ad.active ? "default" : "secondary"}>{ad.active ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="py-3 px-4">{ad.priority}</td>
                      <td className="py-3 px-4">{new Date(ad.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/ads/custom/${ad.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <DeleteCustomAdButton id={ad.id} title={ad.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No custom ads created yet.</p>
              <Link href="/admin/ads/custom/new">
                <Button>Create Your First Ad</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


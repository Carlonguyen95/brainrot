import Link from "next/link"
import { getAdSlots } from "@/lib/actions/ad-slot-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit } from "lucide-react"
import DeleteAdSlotButton from "./delete-button"

export default async function AdSlotsPage() {
  const adSlots = await getAdSlots()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Ad Slots</h1>
        <Link href="/admin/ads/slots/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Slot
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ad Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {adSlots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Slot ID</th>
                    <th className="text-left py-3 px-4">Format</th>
                    <th className="text-left py-3 px-4">Position</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adSlots.map((slot) => (
                    <tr key={slot.id} className="border-b">
                      <td className="py-3 px-4">{slot.name}</td>
                      <td className="py-3 px-4">{slot.slot_id}</td>
                      <td className="py-3 px-4">{slot.format}</td>
                      <td className="py-3 px-4">{slot.position}</td>
                      <td className="py-3 px-4">
                        <Badge variant={slot.active ? "default" : "secondary"}>
                          {slot.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/ads/slots/${slot.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <DeleteAdSlotButton id={slot.id} name={slot.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No ad slots created yet.</p>
              <Link href="/admin/ads/slots/new">
                <Button>Create Your First Slot</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


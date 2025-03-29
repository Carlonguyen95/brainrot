import { notFound } from "next/navigation"
import { getAdSlot } from "@/lib/actions/ad-slot-actions"
import AdSlotForm from "../ad-slot-form"

interface AdSlotEditPageProps {
  params: {
    id: string
  }
}

export default async function AdSlotEditPage({ params }: AdSlotEditPageProps) {
  // Handle "new" as a special case
  if (params.id === "new") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Create New Ad Slot</h1>
        <AdSlotForm />
      </div>
    )
  }

  // Otherwise, fetch the existing slot
  const slotId = Number.parseInt(params.id)

  if (isNaN(slotId)) {
    notFound()
  }

  const slot = await getAdSlot(slotId)

  if (!slot) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Ad Slot</h1>
      <AdSlotForm slot={slot} />
    </div>
  )
}


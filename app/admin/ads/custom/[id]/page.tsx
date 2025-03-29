import { notFound } from "next/navigation"
import { getCustomAd } from "@/lib/actions/custom-ad-actions"
import CustomAdForm from "../custom-ad-form"

interface CustomAdEditPageProps {
  params: {
    id: string
  }
}

export default async function CustomAdEditPage({ params }: CustomAdEditPageProps) {
  // Handle "new" as a special case
  if (params.id === "new") {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Create New Ad</h1>
        <CustomAdForm />
      </div>
    )
  }

  // Otherwise, fetch the existing ad
  const adId = Number.parseInt(params.id)

  if (isNaN(adId)) {
    notFound()
  }

  const ad = await getCustomAd(adId)

  if (!ad) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Ad</h1>
      <CustomAdForm ad={ad} />
    </div>
  )
}


"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import DefinitionForm from "@/components/definition-form"
import Header from "@/components/header"

export default function SubmitPage({
  searchParams = {},
}: {
  searchParams?: { word?: string }
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const word = searchParams.word || ""

  useEffect(() => {
    // Redirect to login if user is not authenticated and not still loading
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render the form until we know the user is authenticated
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Submit a Definition</h1>
          <DefinitionForm initialWord={word} />
        </div>
      </div>
    </div>
  )
}


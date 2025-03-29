import { redirect } from "next/navigation"
import { handleAuthCallback } from "@/lib/auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (code) {
    await handleAuthCallback(code)
  }

  // Redirect to home page after successful authentication
  redirect("/")
}


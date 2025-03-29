"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addAdminUser } from "@/lib/actions/admin-actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function AddAdminForm() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const result = await addAdminUser(username)

      if (result.success) {
        setSuccess(true)
        setUsername("")
        router.refresh()
      } else {
        setError(result.error || "Failed to add admin user")
      }
    } catch (err) {
      console.error("Error adding admin user:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Admin</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">Admin user added successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <form id="add-admin-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter existing username"
            />
            <p className="text-xs text-gray-500">The user must already have an account on the platform</p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="add-admin-form" disabled={isLoading || !username.trim()} className="w-full">
          {isLoading ? "Adding..." : "Add Admin User"}
        </Button>
      </CardFooter>
    </Card>
  )
}


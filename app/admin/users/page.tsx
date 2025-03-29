import { getAdminUsers } from "@/lib/actions/admin-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AddAdminForm from "./add-admin-form"
import RemoveAdminButton from "./remove-admin-button"

export default async function AdminUsersPage() {
  const adminUsers = await getAdminUsers()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Users</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              {adminUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Added On</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((admin) => (
                        <tr key={admin.user_id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={admin.avatar_url || ""} alt={admin.username} />
                                <AvatarFallback>{admin.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span>{admin.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{admin.email}</td>
                          <td className="py-3 px-4">{new Date(admin.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-right">
                            <RemoveAdminButton userId={admin.user_id} username={admin.username} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No admin users found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <AddAdminForm />
        </div>
      </div>
    </div>
  )
}


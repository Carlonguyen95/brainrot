import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { isCurrentUserAdmin } from "@/lib/actions/admin-actions"
import { LayoutDashboard, Settings, Users, BarChart, ImageIcon } from "lucide-react"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Check if user is admin
  const isAdmin = await isCurrentUserAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1D2439] text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="flex items-center p-2 rounded hover:bg-gray-700">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/ads" className="flex items-center p-2 rounded hover:bg-gray-700">
                <Settings className="mr-2 h-5 w-5" />
                Ad Configuration
              </Link>
            </li>
            <li>
              <Link href="/admin/ads/custom" className="flex items-center p-2 rounded hover:bg-gray-700">
                <ImageIcon className="mr-2 h-5 w-5" />
                Custom Ads
              </Link>
            </li>
            <li>
              <Link href="/admin/ads/slots" className="flex items-center p-2 rounded hover:bg-gray-700">
                <Settings className="mr-2 h-5 w-5" />
                Ad Slots
              </Link>
            </li>
            <li>
              <Link href="/admin/analytics" className="flex items-center p-2 rounded hover:bg-gray-700">
                <BarChart className="mr-2 h-5 w-5" />
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="flex items-center p-2 rounded hover:bg-gray-700">
                <Users className="mr-2 h-5 w-5" />
                Admin Users
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}


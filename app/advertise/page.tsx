import Header from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-white">Advertise on Brain Rot Dictionary</h1>
          <p className="text-gray-300 mb-8">
            Reach millions of users who are interested in slang and internet culture.
          </p>

          <div className="bg-[#1D2439] p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Why Advertise With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Targeted Audience</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  Reach Gen Z and Millennial users who are actively engaged with internet culture and slang.
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">High Engagement</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  Our users spend an average of 8 minutes per session browsing definitions and examples.
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Brand Association</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  Associate your brand with the latest trends and internet culture that resonates with younger
                  audiences.
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-[#1D2439] p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Advertising Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Standard Ad Placement</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p className="mb-4">Display your ads throughout the Brain Rot Dictionary site.</p>
                  <ul className="list-disc list-inside mb-4">
                    <li>Banner ads on definition pages</li>
                    <li>Sidebar ads on browse pages</li>
                    <li>Mobile-optimized formats</li>
                  </ul>
                  <div className="font-bold text-white">Starting at $499/month</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Premium Sponsorship</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">
                  <p className="mb-4">Become a featured sponsor with premium placement and branding opportunities.</p>
                  <ul className="list-disc list-inside mb-4">
                    <li>Word of the Day sponsorship</li>
                    <li>Category sponsorship</li>
                    <li>Custom integration options</li>
                  </ul>
                  <div className="font-bold text-white">Starting at $1,999/month</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link href="/advertise/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>

          <div className="bg-[#1D2439] p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">What ad formats do you support?</h3>
                <p className="text-gray-300">
                  We support standard IAB formats including display banners, native ads, and sponsored content
                  opportunities.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">How is pricing determined?</h3>
                <p className="text-gray-300">
                  Pricing is based on placement, duration, and targeting options. We offer both CPM and flat-rate
                  pricing models.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Do you offer targeting options?</h3>
                <p className="text-gray-300">
                  Yes, we offer targeting by demographics, specific slang categories, and geographic regions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">How do I get started?</h3>
                <p className="text-gray-300">
                  Contact our advertising team using the form below, and we'll get back to you within 24 hours to
                  discuss your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#1D2439] text-white py-8 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}


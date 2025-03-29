import type React from "react"
import Link from "next/link"

const AdBanner: React.FC = () => {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 text-center p-2">
      <div className="text-xs text-gray-400 mb-2">AD</div>
      <Link href="/advertise" className="block">
        <div className="bg-white p-4 rounded-md flex items-center justify-center">
          <div className="text-center">
            <div className="font-bold text-lg text-gray-800">Support Brain Rot Dictionary</div>
            <div className="text-sm text-gray-600">Advertise your brand here</div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default AdBanner


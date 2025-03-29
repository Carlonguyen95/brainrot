import type { Metadata } from "next"
import Header from "@/components/header"
import BrainRotTextConverter from "@/components/meme-generator/brain-rot-text-converter"

export const metadata: Metadata = {
  title: "Brainrotify | Convert Normal Text to Gen Z Brain Rot Language",
  description:
    "Transform your boring text into Gen Z brain rot language with our free Brainrotify tool. Add emojis, slang, and chaotic energy to your messages.",
  keywords: "brainrotify, brain rot text, gen z slang generator, text converter, brain rot language",
}

export default function BrainrotifyPage() {
  return (
    <div className="min-h-screen bg-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Brainrotify</h1>
          <p className="text-gray-600 text-center mb-8">
            Transform your boring text into Gen Z brain rot language. Adjust the slider to control how much your brain
            rots.
          </p>

          <BrainRotTextConverter />
        </div>
      </main>

      <footer className="bg-purple-700 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Brain Rot Dictionary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}


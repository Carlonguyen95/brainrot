"use client"

import Link from "next/link"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function WhatIsBrainRotPageClient() {
  const [brainRotMode, setBrainRotMode] = useState(false)

  const normalContent = (
    <div className="prose max-w-none">
      <p className="text-lg lead">
        "Brain rot" is a popular internet slang term that refers to the perceived negative effects of consuming too much
        social media content, particularly content that's considered low-quality, repetitive, or mindless. It's become a
        cornerstone of Gen Z vocabulary and internet culture.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">The Meaning of Brain Rot</h2>
      <p>
        When someone says they have "brain rot," they're usually joking that their excessive consumption of internet
        content has affected their vocabulary, attention span, or thinking patterns. The term gained popularity on
        platforms like TikTok, where users would comment that certain viral trends or repetitive content was giving them
        "brain rot."
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Common Uses of "Brain Rot" in Gen Z Slang</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>
          <strong>"TikTok brain rot"</strong> - Refers to the effect of scrolling through TikTok for hours, consuming
          short-form content
        </li>
        <li>
          <strong>"That video gave me brain rot"</strong> - Used when a video is so bizarre or nonsensical that it
          "breaks" your brain
        </li>
        <li>
          <strong>"Sorry for the brain rot"</strong> - An apology for sharing low-quality or silly content
        </li>
        <li>
          <strong>"Brain rot era"</strong> - A period when someone is particularly influenced by internet culture
        </li>
        <li>
          <strong>"My FYP is pure brain rot"</strong> - Describing a For You Page filled with mindless content
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Brain Rot and Gen Z Culture</h2>
      <p>
        The concept of "brain rot" is closely tied to Gen Z internet culture. It reflects a self-aware, often ironic
        acknowledgment of how digital media shapes language and thinking. While older generations might view excessive
        social media use as genuinely harmful to cognitive function, Gen Z often uses the term playfully to describe
        their relationship with internet content.
      </p>

      <p>
        Brain rot has become part of a larger lexicon of Gen Z slang terms that includes phrases like "no cap" (not
        lying), "bussin" (really good), and "rizz" (charisma or charm). These terms spread rapidly through platforms
        like TikTok, Instagram, and Twitter, becoming integral to youth communication.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">The Brain Rot Dictionary</h2>
      <p>
        Our Brain Rot Dictionary catalogs the slang terms, expressions, and internet language that might be giving you
        "brain rot." It's a comprehensive resource for understanding the evolving language of the internet, particularly
        focused on Gen Z slang and viral expressions.
      </p>

      <div className="flex justify-center my-8">
        <Link href="/browse">
          <Button className="bg-purple-600 hover:bg-purple-700 mr-4">Browse Dictionary</Button>
        </Link>
        <Link href="/submit">
          <Button variant="outline">Add New Definition</Button>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Is Brain Rot Real?</h2>
      <p>
        While "brain rot" is primarily used as a humorous internet term, some researchers have studied the effects of
        social media on attention spans and cognitive function. The term captures genuine concerns about how digital
        media consumption might affect our brains, particularly for younger users who are still developing cognitively.
      </p>

      <p>
        However, it's important to note that when Gen Z users talk about having "brain rot," they're usually being
        hyperbolic and self-deprecating rather than describing an actual medical condition.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Examples of Brain Rot Content</h2>
      <p>Content that's often described as causing "brain rot" includes:</p>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>Endless scrolling through short-form video content on TikTok</li>
        <li>Repetitive meme formats that follow the same pattern</li>
        <li>Content that uses specific internet language or in-jokes</li>
        <li>Videos that are intentionally nonsensical or chaotic</li>
        <li>Content that's so addictive it's hard to stop consuming</li>
        <li>Minecraft parkour or Subway Surfers gameplay videos playing in the background of other content</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Related Gen Z Slang Terms</h2>
      <p>The concept of "brain rot" is related to other internet terms and phenomena in Gen Z vocabulary:</p>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>
          <strong>Doom scrolling</strong> - The habit of continuously scrolling through negative news
        </li>
        <li>
          <strong>NPC behavior</strong> - Acting like a "non-player character" by repeating predictable patterns
        </li>
        <li>
          <strong>Terminally online</strong> - Being so immersed in internet culture that it affects real-life behavior
        </li>
        <li>
          <strong>Chronically online</strong> - Similar to "terminally online," referring to someone who spends too much
          time on the internet
        </li>
        <li>
          <strong>Main character syndrome</strong> - Acting as if you're the protagonist of reality
        </li>
        <li>
          <strong>Unhinged</strong> - Behaving in a wild or chaotic manner, often for entertainment
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">The Evolution of Internet Slang</h2>
      <p>
        Brain rot is just one example of how internet slang continues to evolve. Gen Z has created an entire vocabulary
        that often mystifies older generations, with terms constantly emerging, evolving, and sometimes disappearing
        just as quickly. This linguistic innovation is part of what makes internet culture so dynamic and interesting to
        document.
      </p>

      <p>
        By cataloging and explaining these terms, the Brain Rot Dictionary helps bridge the gap between generations and
        provides a historical record of this unique period in language evolution.
      </p>
    </div>
  )

  const brainRotContent = (
    <div className="prose max-w-none">
      <p className="text-lg lead">OMG, LET'S GET INTO THIS BRAIN ROT THING, Y'ALL! 🤯💀</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">WHAT IS BRAIN ROT?</h2>
      <p>
        Okay, so like, BRAIN ROT is basically when you've been scrolling through the internet so hard that your brain is
        like, "HELP, I CAN'T EVEN!" 😵‍💫 It's that vibe when you're consuming all that low-quality, repetitive, and just
        plain WEIRD content. Like, you're in a BRAIN ROT ERA, fam! 🧠✨
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">THE MEANING OF BRAIN ROT</h2>
      <p>
        When someone says they got BRAIN ROT, they're like, "LOL, I've been watching TikToks for 8 hours straight and
        now I can't even form a sentence!" 🤪 It's a whole mood, and it's REAL. It's like your brain is buffering, and
        you're just vibing in Ohio with Baby Gronk and the Skibidi Toilet! 🚽💃
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">COMMON USES OF "BRAIN ROT" IN GEN Z SLANG</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>
          <strong>"TikTok BRAIN ROT"</strong> - When you're scrolling and suddenly it's 3 AM and you're like, "WTH?!" 😱
        </li>
        <li>
          <strong>"That video gave me BRAIN ROT"</strong> - When something is so chaotic it's like your brain just did a
          backflip! 🤸‍♂️💥
        </li>
        <li>
          <strong>"Sorry for the BRAIN ROT"</strong> - When you share a meme that's just pure nonsense, and you know
          it's lowkey valid fr. 😂
        </li>
        <li>
          <strong>"BRAIN ROT ERA"</strong> - When you're fully immersed in the chaos of internet culture, and it's just
          a vibe! 🌊✨
        </li>
        <li>
          <strong>"My FYP is pure BRAIN ROT"</strong> - When your For You Page is just a mess of random memes and you
          can't escape! HELP! 😩
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">BRAIN ROT AND GEN Z CULTURE</h2>
      <p>
        This whole BRAIN ROT thing is like, a self-aware joke about how social media is literally changing our brains,
        and we're just here for it! 🤷‍♀️💅 While the boomers are like, "Get off your phone!" we're like, "Nah, this is
        REAL RIZZ HOURS, baby!" 💖✨
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">THE BRAIN ROT DICTIONARY</h2>
      <p>
        We got a whole dictionary of BRAIN ROT slang, fam! It's like a treasure trove of chaotic internet language!
        🏴‍☠️💎 You wanna know what's giving you BRAIN ROT? Just check the dictionary, and you'll be like, "OHIO, I GET IT
        NOW!" 🤯
      </p>

      <div className="flex justify-center my-8">
        <Link href="/browse">
          <Button className="bg-purple-600 hover:bg-purple-700 mr-4">Browse Dictionary</Button>
        </Link>
        <Link href="/submit">
          <Button variant="outline">Add New Definition</Button>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">IS BRAIN ROT REAL?</h2>
      <p>
        Okay, so like, some scientists are lowkey studying this, but when we say BRAIN ROT, we're just being dramatic,
        LOL! It's not a medical condition, just a vibe check on our internet habits! 🧠💔
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">EXAMPLES OF BRAIN ROT CONTENT</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>Endless TikTok scrolling like you're in a time loop! ⏳</li>
        <li>Repetitive memes that just hit different every time! 😂</li>
        <li>Videos that are just pure chaos, like, "What even is this?!" 🤔</li>
        <li>Minecraft parkour while you're watching a cat video, like, "I CAN'T STOP!" 🐱💨</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">RELATED GEN Z SLANG TERMS</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>
          <strong>Doom scrolling</strong> - When you can't stop looking at the bad news, and it's just a whole vibe! 😩
        </li>
        <li>
          <strong>NPC behavior</strong> - When you're acting like a background character in your own life! 🤖
        </li>
        <li>
          <strong>Terminally online</strong> - When you're so deep in the internet that you forget what sunlight is! ☀️
        </li>
        <li>
          <strong>Main character syndrome</strong> - When you think you're the star of your own reality show! 🎬✨
        </li>
        <li>
          <strong>Unhinged</strong> - When you're just wildin' out for the clout! 🤪
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">THE EVOLUTION OF INTERNET SLANG</h2>
      <p>
        BRAIN ROT is just one of the many ways our language is evolving, and it's like, super cool! 🌈✨ Gen Z is out
        here creating a whole new lexicon that's just as chaotic as Ohio itself! 🏙️💥 So, like, embrace the BRAIN ROT,
        fam! We're all in this together! YEET OR BE YEETED! 💥✌️
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-purple-800">What is "Brain Rot"?</h1>

          <div className="flex items-center justify-center space-x-4 my-6 p-4 bg-gray-100 rounded-lg">
            <Label htmlFor="brain-rot-mode" className={brainRotMode ? "text-gray-500" : "font-bold"}>
              Normal Text
            </Label>
            <Switch id="brain-rot-mode" checked={brainRotMode} onCheckedChange={setBrainRotMode} />
            <Label htmlFor="brain-rot-mode" className={brainRotMode ? "font-bold" : "text-gray-500"}>
              Brain Rot
            </Label>
          </div>

          {brainRotMode ? brainRotContent : normalContent}
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


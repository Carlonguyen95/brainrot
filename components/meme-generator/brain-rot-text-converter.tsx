"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Copy, RefreshCw } from "lucide-react"

// Common Gen Z slang terms and expressions
const SLANG_REPLACEMENTS = [
  { pattern: /you/gi, replacement: "u" },
  { pattern: /your/gi, replacement: "ur" },
  { pattern: /are/gi, replacement: "r" },
  { pattern: /for/gi, replacement: "4" },
  { pattern: /to/gi, replacement: "2" },
  { pattern: /too/gi, replacement: "2" },
  { pattern: /be/gi, replacement: "b" },
  { pattern: /see/gi, replacement: "c" },
  { pattern: /okay|ok/gi, replacement: "k" },
  { pattern: /love/gi, replacement: "luv" },
  { pattern: /what/gi, replacement: "wat" },
  { pattern: /that/gi, replacement: "dat" },
  { pattern: /the/gi, replacement: "da" },
  { pattern: /this/gi, replacement: "dis" },
  { pattern: /with/gi, replacement: "w/" },
  { pattern: /really/gi, replacement: "rly" },
  { pattern: /please/gi, replacement: "plz" },
  { pattern: /thanks/gi, replacement: "thx" },
  { pattern: /thank you/gi, replacement: "thx" },
  { pattern: /laugh out loud|laughing out loud/gi, replacement: "lol" },
  { pattern: /oh my god/gi, replacement: "omg" },
  { pattern: /in my opinion/gi, replacement: "imo" },
  { pattern: /by the way/gi, replacement: "btw" },
  { pattern: /as soon as possible/gi, replacement: "asap" },
  { pattern: /i don't know/gi, replacement: "idk" },
  { pattern: /rolling on the floor laughing/gi, replacement: "rofl" },
  { pattern: /talk to you later/gi, replacement: "ttyl" },
  { pattern: /as far as i know/gi, replacement: "afaik" },
  { pattern: /in real life/gi, replacement: "irl" },
  { pattern: /on my way/gi, replacement: "omw" },
  { pattern: /no problem/gi, replacement: "np" },
  { pattern: /shaking my head/gi, replacement: "smh" },
  { pattern: /not gonna lie/gi, replacement: "ngl" },
  { pattern: /to be honest/gi, replacement: "tbh" },
  { pattern: /for real/gi, replacement: "fr" },
  { pattern: /for real for real/gi, replacement: "fr fr" },
  { pattern: /because/gi, replacement: "cuz" },
  { pattern: /about/gi, replacement: "bout" },
  { pattern: /going to/gi, replacement: "gonna" },
  { pattern: /want to/gi, replacement: "wanna" },
  { pattern: /got to/gi, replacement: "gotta" },
  { pattern: /kind of/gi, replacement: "kinda" },
  { pattern: /sort of/gi, replacement: "sorta" },
  { pattern: /out of/gi, replacement: "outta" },
  // Additional Gen Z slang terms
  { pattern: /cool|awesome|amazing/gi, replacement: "bussin" },
  { pattern: /good|great/gi, replacement: "fire" },
  { pattern: /bad|terrible/gi, replacement: "mid" },
  { pattern: /friend|friends/gi, replacement: "bestie" },
  { pattern: /attractive|hot/gi, replacement: "baddie" },
  { pattern: /impressive/gi, replacement: "slaps" },
  { pattern: /annoying|annoyed/gi, replacement: "pressed" },
  { pattern: /upset|sad/gi, replacement: "down bad" },
  { pattern: /excited|happy/gi, replacement: "vibin" },
  { pattern: /suspicious/gi, replacement: "sus" },
  { pattern: /lying|lie/gi, replacement: "cap" },
  { pattern: /truth|true/gi, replacement: "no cap" },
  { pattern: /charisma|charm/gi, replacement: "rizz" },
  { pattern: /flirt|flirting/gi, replacement: "pulling" },
  { pattern: /understand|get it/gi, replacement: "understood the assignment" },
  { pattern: /impressive|skilled/gi, replacement: "built different" },
  { pattern: /boring|bored/gi, replacement: "dead" },
  // Advanced Gen Z slang
  { pattern: /hello/gi, replacement: "YO WHAT'S UP" },
  { pattern: /hi/gi, replacement: "YOOOO" },
  { pattern: /goodbye/gi, replacement: "PEACE OUT" },
  { pattern: /what/gi, replacement: "WHAT IN THE OHIO" },
  { pattern: /wow/gi, replacement: "I'M SCREAMING" },
  { pattern: /surprised/gi, replacement: "SHOOKETH" },
  { pattern: /laughing/gi, replacement: "CRYING AND THROWING UP" },
  { pattern: /excited/gi, replacement: "LIVING MY BEST LIFE RN" },
  { pattern: /agree/gi, replacement: "PERIODT POOH" },
  { pattern: /disagree/gi, replacement: "NOT THE VIBE CHECK" },
  { pattern: /like/gi, replacement: "OBSESSED WITH" },
  { pattern: /dislike/gi, replacement: "GIVING VERY MUCH FLOP ENERGY" },
  { pattern: /tired/gi, replacement: "RUNNING ON ZERO BATTERY" },
  { pattern: /confused/gi, replacement: "MY LAST BRAIN CELL LEFT THE CHAT" },
]

// Add slang phrases to randomly insert
const BRAIN_ROT_PHRASES = [
  "no cap",
  "fr fr",
  "based",
  "sigma",
  "lowkey",
  "highkey",
  "respectfully",
  "living rent free in my head",
  "main character energy",
  "it's giving",
  "not the",
  "slay",
  "periodt",
  "as you should",
  "i'm weak",
  "that's so",
  "literally me",
  "vibe check",
  "rent free",
  "ratio",
  "W",
  "L",
  "caught in 4k",
  "touch grass",
  "yeet",
  "sheesh",
  "skibidi",
  "gyat",
  "rizz",
  "on god",
  "finna",
  "bet",
  "bruh moment",
  "simp",
  "chad",
  "cope",
  "sus",
  "no thoughts just vibes",
  "ate and left no crumbs",
  "understood the assignment",
  "unhinged",
  "chronically online",
  "terminally online",
  "not me",
  "core",
  "era",
  "the way",
  "i'm dead",
  "crying",
  "screaming",
  "throwing up",
  "sobbing",
  "skibidi toilet fr",
  "real ohio moment",
  "baby gronk energy",
  "naur because literally",
  "mother is mothering",
  "slay the house down boots",
  "help-",
  "i can't-",
  "the way i-",
  "YEET OR BE YEETED",
  "let's get this bread",
  "sauce it up",
  "straight fire",
  "I can't even",
  "fam",
  "shook",
  "vibin'",
  "legend",
  "whole vibe",
  "real rizz hours",
  "gyatted",
  "flexin'",
  "brainrot magic",
]

// Emojis to randomly insert
const BRAIN_ROT_EMOJIS = [
  "💀",
  "😭",
  "🤣",
  "👁️👄👁️",
  "✨",
  "🔥",
  "💯",
  "🙏",
  "😩",
  "🥺",
  "😤",
  "🤪",
  "💅",
  "👀",
  "🤡",
  "🧠",
  "🫠",
  "🫡",
  "🫥",
  "🫣",
  "🤌",
  "🙃",
  "😈",
  "🥴",
  "🤓",
  "🤨",
  "🤧",
  "🤭",
  "🤔",
  "🤷‍♀️",
  "🤦‍♂️",
  "🧢",
  "❌",
  "⭐",
  "⚡",
  "🌟",
  "🌈",
  "🌊",
  "🍦",
  "🍭",
  "🎯",
  "🎪",
  "🎭",
  "🎬",
  "🎮",
  "🎧",
  "🎤",
  "🎵",
  "🎶",
  "😎",
  "🥳",
  "💪",
  "🏈",
  "💥",
  "😍",
  "💖",
  "🚽",
  "💃",
  "🧠",
  "💡",
  "🍗",
  "💦",
  "💨",
]

// Common exclamations to add
const EXCLAMATIONS = ["!!!", "!?!?", "?!?!", "!!", "?!", "!?"]

export default function BrainRotTextConverter() {
  const [inputText, setInputText] = useState(
    "Hello! I hope you're doing well. I wanted to let you know that I really appreciate your help with this project. You're a good friend and I think your work is impressive. I'm excited to see the final result. No lie, this is going to be amazing. I understand what we need to do next.",
  )
  const [outputText, setOutputText] = useState("")
  const [rotLevel, setRotLevel] = useState(50)
  const [isConverting, setIsConverting] = useState(false)

  const convertToBrainRot = () => {
    setIsConverting(true)

    // Simulate processing delay
    setTimeout(() => {
      let result = inputText

      // Apply text replacements based on brain rot level
      const replacementsToApply = Math.floor((SLANG_REPLACEMENTS.length * rotLevel) / 100)

      for (let i = 0; i < replacementsToApply; i++) {
        const { pattern, replacement } = SLANG_REPLACEMENTS[i]
        result = result.replace(pattern, replacement)
      }

      // Split into sentences for processing
      let sentences = result.split(/(?<=[.!?])\s+/)

      // Process each sentence
      sentences = sentences.map((sentence) => {
        // Skip empty sentences
        if (!sentence.trim()) return sentence

        // For higher rot levels, capitalize entire words randomly
        if (rotLevel > 30) {
          const words = sentence.split(" ")

          // Process each word
          const processedWords = words.map((word) => {
            // Higher rot level = more chance of capitalizing entire words
            if (Math.random() * 100 < rotLevel / 3) {
              return word.toUpperCase()
            }
            return word
          })

          sentence = processedWords.join(" ")
        }

        // Add exclamations for higher rot levels
        if (rotLevel > 40 && Math.random() * 100 < rotLevel / 2) {
          // Replace period with exclamation
          sentence = sentence.replace(/\.$/, "")

          // Add random exclamation
          const exclamation = EXCLAMATIONS[Math.floor(Math.random() * EXCLAMATIONS.length)]
          sentence += exclamation
        }

        // Add emojis based on brain rot level
        if (rotLevel > 20) {
          // Higher rot level = more emojis
          const emojiCount = Math.floor((Math.random() * rotLevel) / 15) + 1

          // Add emojis at the end of the sentence
          for (let i = 0; i < emojiCount; i++) {
            const randomEmoji = BRAIN_ROT_EMOJIS[Math.floor(Math.random() * BRAIN_ROT_EMOJIS.length)]
            sentence += " " + randomEmoji
          }
        }

        return sentence
      })

      // Rejoin sentences
      result = sentences.join(" ")

      // Add random slang phrases based on brain rot level
      if (rotLevel > 40) {
        // Split into sentences again (after emoji additions)
        sentences = result.split(/(?<=[.!?])\s+/)

        result = sentences
          .map((sentence) => {
            // Higher rot level = more chance of adding slang phrases
            if (Math.random() * 100 < rotLevel / 2) {
              const randomPhrase = BRAIN_ROT_PHRASES[Math.floor(Math.random() * BRAIN_ROT_PHRASES.length)]

              // Different ways to insert phrases
              const insertionType = Math.floor(Math.random() * 4)

              switch (insertionType) {
                case 0: // Add at beginning
                  return randomPhrase + " " + sentence
                case 1: // Add at end
                  return sentence + " " + randomPhrase
                case 2: // Add as interjection
                  const words = sentence.split(" ")
                  if (words.length > 3) {
                    const insertPosition = Math.floor(Math.random() * (words.length - 1)) + 1
                    words.splice(insertPosition, 0, randomPhrase)
                    return words.join(" ")
                  }
                  return sentence + " " + randomPhrase
                case 3: // Replace part of sentence with slang
                  if (sentence.length > 10) {
                    const startPos = Math.floor(Math.random() * (sentence.length / 2))
                    const endPos = startPos + Math.floor(Math.random() * (sentence.length / 4)) + 3
                    return sentence.substring(0, startPos) + " " + randomPhrase + " " + sentence.substring(endPos)
                  }
                  return randomPhrase + " " + sentence
              }
            }
            return sentence
          })
          .join(" ")
      }

      // Add extra letters based on brain rot level
      if (rotLevel > 70) {
        result = result.replace(/([aeiou])/gi, (match) => {
          // Higher rot level = more repeated vowels
          if (Math.random() * 100 < rotLevel - 60) {
            const repeatCount = Math.floor(Math.random() * 3) + 1
            return match.repeat(repeatCount)
          }
          return match
        })
      }

      // For extreme rot levels (80+), add some extra chaos
      if (rotLevel > 80) {
        // Add emoji pairs throughout the text
        const words = result.split(" ")

        for (let i = 0; i < words.length; i++) {
          if (Math.random() * 100 < rotLevel / 5) {
            const emoji1 = BRAIN_ROT_EMOJIS[Math.floor(Math.random() * BRAIN_ROT_EMOJIS.length)]
            const emoji2 = BRAIN_ROT_EMOJIS[Math.floor(Math.random() * BRAIN_ROT_EMOJIS.length)]
            words[i] = words[i] + emoji1 + emoji2
          }
        }

        result = words.join(" ")

        // Add "fr fr" or "no cap" at random places
        if (Math.random() < 0.7) {
          const endPhrase = Math.random() < 0.5 ? " fr fr" : " no cap"

          // Split into sentences
          sentences = result.split(/(?<=[.!?])\s+/)

          // Add phrase to a random sentence
          const randomIndex = Math.floor(Math.random() * sentences.length)
          sentences[randomIndex] += endPhrase

          result = sentences.join(" ")
        }
      }

      // For extreme rot levels (90+), add even more chaos
      if (rotLevel > 90) {
        // Add random interjections at the beginning
        const intros = [
          "YO! ",
          "LISTEN UP! ",
          "OMG! ",
          "BRUH! ",
          "SHEESH! ",
          "YOOOO! ",
          "HEAR ME OUT! ",
          "I CAN'T EVEN! ",
          "BESTIE! ",
        ]

        const randomIntro = intros[Math.floor(Math.random() * intros.length)]
        result = randomIntro + result

        // Add multiple exclamation marks at the end
        result += "!!!"

        // Add a final emoji burst
        const finalEmojiCount = Math.floor(Math.random() * 5) + 3
        let finalEmojis = ""

        for (let i = 0; i < finalEmojiCount; i++) {
          finalEmojis += BRAIN_ROT_EMOJIS[Math.floor(Math.random() * BRAIN_ROT_EMOJIS.length)]
        }

        result += " " + finalEmojis
      }

      setOutputText(result)
      setIsConverting(false)
    }, 500)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
    alert("Brain rot text copied to clipboard!")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="inputText">Normal Text</Label>
                <Textarea
                  id="inputText"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to convert to brain rot"
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="rotLevel">Brain Rot Level: {rotLevel}%</Label>
                <Slider
                  id="rotLevel"
                  min={0}
                  max={100}
                  step={1}
                  value={[rotLevel]}
                  onValueChange={(value) => setRotLevel(value[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Normal</span>
                  <span>Mid Rot</span>
                  <span>Extreme Brain Rot</span>
                </div>
              </div>

              <Button
                onClick={convertToBrainRot}
                disabled={isConverting || !inputText.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Brainrottify Text"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="outputText">Brain Rot Text</Label>
                <div className="relative">
                  <Textarea
                    id="outputText"
                    value={outputText}
                    readOnly
                    placeholder="Your brain rot text will appear here"
                    className="min-h-[200px]"
                  />
                  {outputText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-200 hover:bg-gray-300"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {outputText && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium text-sm mb-2">Brain Rot Translation Guide:</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• "u" = you</li>
                    <li>• "r" = are</li>
                    <li>• "2" = to/too</li>
                    <li>• "fr fr" = for real for real</li>
                    <li>• "smh" = shaking my head</li>
                    <li>• "ngl" = not gonna lie</li>
                    <li>• "bussin" = amazing</li>
                    <li>• "mid" = bad/mediocre</li>
                    <li>• "sigma" = strong/independent</li>
                    <li>• "based" = agreeable/good</li>
                    <li>• "rizz" = charisma/charm</li>
                    <li>• "no cap" = truth/no lie</li>
                    <li>• "skibidi" = trendy/cool</li>
                    <li>• "ohio" = chaotic/weird</li>
                    <li>• "gyat/gyatted" = impressed/amazed</li>
                    <li>• "YEET" = throw/discard enthusiastically</li>
                    <li>• Excessive emojis = Gen Z expression</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


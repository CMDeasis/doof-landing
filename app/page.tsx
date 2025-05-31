"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Gamepad2, Play, ArrowRight, Volume2, VolumeX } from "lucide-react"

export default function DoofioWelcome() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [showButtons, setShowButtons] = useState(false)
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const welcomeLines = ["Hello,", "Welcome to", "DOOFIO.SITE"]

  // Star field animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create stars
    const stars: Array<{
      x: number
      y: number
      z: number
      prevX: number
      prevY: number
      size: number
      color: string
    }> = []

    const numStars = 800
    const colors = ["#ffffff", "#b794f6", "#63b3ed", "#68d391", "#f093fb"]

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * 1000,
        prevX: 0,
        prevY: 0,
        size: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      stars.forEach((star) => {
        star.prevX = (star.x / star.z) * 100 + centerX
        star.prevY = (star.y / star.z) * 100 + centerY

        star.z -= 2

        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - canvas.width / 2
          star.y = Math.random() * canvas.height - canvas.height / 2
          star.z = 1000
        }

        const x = (star.x / star.z) * 100 + centerX
        const y = (star.y / star.z) * 100 + centerY

        const opacity = 1 - star.z / 1000
        const size = (1 - star.z / 1000) * star.size

        // Draw star trail
        ctx.strokeStyle =
          star.color +
          Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.lineWidth = size
        ctx.beginPath()
        ctx.moveTo(star.prevX, star.prevY)
        ctx.lineTo(x, y)
        ctx.stroke()

        // Draw star
        ctx.fillStyle =
          star.color +
          Math.floor(opacity * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.log("Audio not supported")
      }
    }

    initAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Create typing sound
  const playTypingSound = () => {
    if (!isSoundEnabled || !audioContextRef.current) return

    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Create a subtle click sound
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime)
      oscillator.type = "square"

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.05)
    } catch (error) {
      console.log("Error playing sound:", error)
    }
  }

  // Create line completion sound
  const playLineCompleteSound = () => {
    if (!isSoundEnabled || !audioContextRef.current) return

    try {
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Create a subtle completion chime
      oscillator.frequency.setValueAtTime(600, ctx.currentTime)
      oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.2)
    } catch (error) {
      console.log("Error playing sound:", error)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Trigger loading animation
    setTimeout(() => setIsLoaded(true), 500)

    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const typewriterDelay = 1000 // Wait 1 second after page loads
    const typingSpeed = 100 // Speed of typing each character
    const lineDelay = 500 // Delay between lines

    const startTypewriter = () => {
      let currentText = ""
      let lineIndex = 0
      let charIndex = 0

      const typeNextChar = () => {
        if (lineIndex < welcomeLines.length) {
          const currentLine = welcomeLines[lineIndex]

          if (charIndex < currentLine.length) {
            currentText += currentLine[charIndex]
            setTypewriterText(currentText)
            playTypingSound() // Play sound for each character
            charIndex++
            setTimeout(typeNextChar, typingSpeed)
          } else {
            // Finished current line
            setCurrentLineIndex(lineIndex)
            playLineCompleteSound() // Play completion sound
            lineIndex++
            charIndex = 0

            if (lineIndex < welcomeLines.length) {
              currentText += "\n"
              setTimeout(typeNextChar, lineDelay)
            } else {
              // All lines completed, show buttons
              setTimeout(() => setShowButtons(true), 500)
            }
          }
        }
      }

      setTimeout(typeNextChar, typewriterDelay)
    }

    startTypewriter()
  }, [isLoaded, isSoundEnabled])

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled)

    // Resume audio context if it's suspended (required by some browsers)
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }
  }

  const renderTypewriterText = () => {
    const lines = typewriterText.split("\n")

    return lines.map((line, index) => {
      let className = "block mb-2"

      if (index === 0) {
        className += " text-white"
      } else if (index === 1) {
        className += " bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent"
      } else if (index === 2) {
        className += " bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
      }

      return (
        <span key={index} className={className}>
          {line}
          {index === currentLineIndex && index === lines.length - 1 && (
            <span className="animate-pulse text-purple-400">|</span>
          )}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans flex items-center justify-center">
      {/* Galaxy Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 25%, #0f0f23 50%, #000000 100%)" }}
      />

      {/* Additional Galaxy Effects */}
      <div className="fixed inset-0 z-0">
        {/* Nebula clouds */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Mouse-following cosmic dust */}
        <div
          className="absolute w-96 h-96 bg-gradient-radial from-purple-500/5 via-blue-500/5 to-transparent rounded-full blur-2xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />

        {/* Distant galaxies */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-60 animate-pulse"></div>
        <div
          className="absolute top-40 left-32 w-3 h-3 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full opacity-50 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 right-40 w-2 h-2 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-70 animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-3 h-3 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Sound Toggle Button */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-16 z-50 p-2 rounded-lg bg-gray-900/70 border border-purple-500/30 hover:bg-gray-800/70 transition-colors backdrop-blur-sm"
        title={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {isSoundEnabled ? (
          <Volume2 className="w-5 h-5 text-purple-300" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Main Content */}
      <div
        className={`relative z-10 text-center max-w-4xl mx-auto px-4 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/25">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wider drop-shadow-lg">
            DOOFIO
          </span>
        </div>

        {/* Welcome Message with Typewriter Effect */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight min-h-[200px] md:min-h-[300px] flex flex-col justify-center drop-shadow-2xl">
            {renderTypewriterText()}
          </h1>

          <div
            className={`transition-all duration-500 ${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
              Your gateway to an epic digital experience.
              <br />
              Ready to explore what's inside?
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 transition-all duration-500 ${showButtons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold group transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Enter Site
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300 backdrop-blur-sm"
          >
            Learn More
          </Button>
        </div>

        {/* Status Indicator */}
        <div
          className={`flex items-center justify-center space-x-2 text-sm text-purple-200 transition-all duration-500 ${showButtons ? "opacity-100" : "opacity-0"}`}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
          <span>System Online • Ready to Connect</span>
        </div>
      </div>

      {/* Corner decorations with cosmic theme */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400/40"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-400/40"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-green-400/40"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400/40"></div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Video, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-accent-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-highlight/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Zap className="w-4 h-4 mr-2" />
            10,000+ Users Watching Together
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Watch Together,
            <br />
            <span className="bg-gradient-to-r from-accent-primary via-accent-highlight to-accent-primary bg-clip-text text-transparent">
              Experience More
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
            Create synchronized watch parties with friends. Stream from anywhere, chat in real-time, and share
            unforgettable moments together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="px-8 py-4 text-lg font-semibold" asChild>
              <Link href="/register">
                <Play className="w-5 h-5 mr-2" />
                Start Watching Free
              </Link>
            </Button>

            <Button variant="secondary" size="lg" className="px-8 py-4 text-lg" asChild>
              <Link href="/features">
                <Video className="w-5 h-5 mr-2" />
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-primary mb-2">10K+</div>
              <div className="text-text-secondary">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-highlight mb-2">50K+</div>
              <div className="text-text-secondary">Watch Parties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-success mb-2">99.9%</div>
              <div className="text-text-secondary">Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

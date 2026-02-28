import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Brain,
  BarChart3,
  BookOpen,
  Users,
  CheckCircle2,
  Shield,
  Heart,
  TrendingUp,
  Clock,
  AlertCircle,
  Zap,
  Target
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50" style={{ backgroundColor: '#eff6ff', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-blue-900" style={{ backgroundColor: '#1e3a8a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo.png"
                alt="NutritionCents"
                width={28}
                height={28}
                className="rounded-lg sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-bold text-white">
                NutritionCents
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-xl font-medium text-white hover:text-blue-200 transition-all duration-200 hover:scale-105">
                Features
              </Link>
              <Link href="#how-it-works" className="text-xl font-medium text-white hover:text-blue-200 transition-all duration-200 hover:scale-105">
                How It Works
              </Link>
              <Link href="#comparison" className="text-xl font-medium text-white hover:text-blue-200 transition-all duration-200 hover:scale-105">
                Why Us
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-white hover:text-blue-200 hover:bg-blue-800/50 transition-all duration-200 hover:scale-105 text-sm sm:text-lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-white text-blue-900 hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-lg px-3 sm:px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="text-xs sm:text-sm font-medium text-blue-700 uppercase tracking-wide">
                YOUR AI BEHAVIOR COMPANION
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-900 leading-tight">
                The first nutrition app
                <br />
                focused on <span className="text-blue-600">adherence</span>,
                <br />
                not logging.
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-800 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We don't track failure — we prevent disengagement. Our AI applies behavioral psychology at the moment of food decisions to help you stay consistent.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4">
                <Link href="/login">
                  <Button size="lg" className="bg-blue-900 text-white hover:bg-blue-800 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 min-h-[56px] sm:min-h-[60px]">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-2 border-blue-900 text-blue-900 hover:bg-blue-50 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 min-h-[56px] sm:min-h-[60px]">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/assets/food-banner.jpg"
                  alt="Nutrition tracking dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section id="features" className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
              Most Apps Optimize Logging.<br />We Optimize Adherence.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-800 max-w-3xl mx-auto px-4 leading-relaxed">
              This is not a chatbot. It's a decision-support system that sees the slip coming and intervenes before it happens.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Pattern Intelligence
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                AI learns when you overeat, what triggers spirals, skip→binge cycles, and stress-related eating patterns. Silent, always on.
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Predictive Intervention
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Instead of reacting after failure, we intervene before the slip. "Hey — Thursdays are tough. Want a fast protein win?"
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Emotional Eating Support
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Detects late-night spikes, comfort food clusters, and voice tone stress. Psychology-backed, not therapy.
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Recovery Mode
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                No streak loss. No red alerts. When you overeat, goals dynamically adjust. "Today shifted. Let's aim for 60% success."
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Nutrition GPS
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Missed protein? Over calories? AI recalculates the best remaining path. "You're off target. Here's the easiest way to finish strong."
              </p>
            </div>
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Gets More Reliable Over Time
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Explicitly designed to get more accurate as it learns you. Your companion that truly understands your patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Functions */}
      <section id="services" className="py-12 sm:py-16 lg:py-24 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
              Everything You Need to Track
            </h2>
            <p className="text-base sm:text-lg text-blue-800 max-w-3xl mx-auto px-4 leading-relaxed">
              This is table stakes. Your advantage starts after this.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="p-6 sm:p-8 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-900 text-white rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Multiple Input Methods
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Text logging, voice logging, food image recognition, and barcode scanning. Log however works for you.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-900 text-white rounded-lg flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Complete Nutrition Engine
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Macros, micros, custom goals (fat loss, muscle gain, health), and weekly & monthly trends.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-900 text-white rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Smart Dashboard
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Macro breakdown, weekly consistency graph, protein & water focus indicators, and trend arrows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
              How It Works: A Real Example
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 sm:space-y-8">
              <div className="p-6 sm:p-8 bg-blue-50 border-l-4 border-blue-900 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-900 text-white rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">Day 23: Thursday 6pm</h3>
                    <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-3">
                      You skipped breakfast. Protein is low. Past pattern detected: takeout binge risk.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <p className="text-sm sm:text-base text-blue-900 font-medium italic">
                        "Hey — Thursdays are usually tough. Want a fast protein win or a 'damage-control' dinner?"
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-2">No macros. No guilt. Just help.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-blue-50 border-l-4 border-blue-900 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-900 text-white rounded-lg flex-shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">Later That Night</h3>
                    <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-3">
                      You ate pizza. You logged it.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <p className="text-sm sm:text-base text-blue-900 font-medium italic">
                        "Okay. Let's switch to recovery mode. One glass of water + normal dinner tomorrow."
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-2">No streak loss. No red alerts. You feel safe. You stay.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Image Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/assets/YouTube Banner.jpg"
              alt="NutritionCents platform"
              width={1200}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Competitive Comparison */}
      <section id="comparison" className="py-12 sm:py-16 lg:py-24 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
                Why You Win Against Others
              </h2>
              <p className="text-base sm:text-lg text-blue-800 max-w-3xl mx-auto px-4">
                We're not competing with MyFitnessPal. We're competing with people quitting on themselves.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 lg:p-8 border border-blue-200 rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-blue-200">
                      <th className="text-left py-3 px-4 text-sm sm:text-base font-bold text-blue-900">Feature</th>
                      <th className="text-center py-3 px-4 text-sm sm:text-base font-semibold text-blue-700">Other Apps</th>
                      <th className="text-center py-3 px-4 text-sm sm:text-base font-bold text-blue-900">NutritionCents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {[
                      { feature: "Food Tracking", others: true, us: true },
                      { feature: "Nutrition Accuracy", others: true, us: true },
                      { feature: "Behavior Prediction", others: false, us: true },
                      { feature: "Emotional Eating Support", others: false, us: true },
                      { feature: "Shame-Free Recovery", others: false, us: true },
                      { feature: "AI Intervention Timing", others: false, us: true, highlight: true },
                      { feature: "Psychology Integration", others: false, us: true },
                    ].map((item, idx) => (
                      <tr key={idx} className={item.highlight ? "bg-blue-50" : ""}>
                        <td className="py-4 px-4 text-sm sm:text-base font-medium text-blue-900">{item.feature}</td>
                        <td className="py-4 px-4 text-center">
                          {item.others === true ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-400 mx-auto" />
                          ) : (
                            <span className="text-blue-400 text-lg">✗</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <CheckCircle2 className="w-5 h-5 text-blue-900 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-24 bg-blue-900 text-white" style={{ backgroundColor: '#1e3a8a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 leading-tight">
            Ready for a Companion That Sees the Slip Coming?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-50 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            Join users who stay consistent because their AI companion prevents disengagement, not just tracks food.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 items-stretch sm:items-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 min-h-[56px] sm:min-h-[60px]" style={{ backgroundColor: '#ffffff', color: '#1e3a8a' }}>
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 hover:text-white text-base text-[#1e3a8a] sm:text-lg px-6 sm:px-8 py-6 sm:py-7 min-h-[56px] sm:min-h-[60px]" style={{ borderColor: '#ffffff' }}>
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm sm:text-base text-blue-200 mt-6 sm:mt-8 max-w-xl mx-auto px-4">
            No credit card required. Start building better habits today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 sm:py-12" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Image
                  src="/assets/logo.png"
                  alt="NutritionCents"
                  width={28}
                  height={28}
                  className="rounded-lg sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-bold text-white">NutritionCents</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                The first nutrition app focused on adherence, not logging. Your AI behavior companion.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#services" className="text-slate-400 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="#comparison" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-400" style={{ borderColor: '#1e293b' }}>
            <p>&copy; {new Date().getFullYear()} NutritionCents. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

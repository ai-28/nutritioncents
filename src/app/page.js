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
  Target,
  ListChecks,
  Watch,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#eff6ff", minHeight: "100vh" }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 w-full rounded-b-2xl bg-blue-900"
        style={{ backgroundColor: "#58AB4F" }}
      >
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
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="cursor-pointer text-white hover:bg-green-800/50 rounded-full transition-all duration-200 hover:scale-105 text-base sm:text-sm md:text-lg px-2 sm:px-3 py-1 sm:py-2">
                  Sign In
                </Button>
              </Link>
              {/* <Link href="/login">
                <Button size="sm" className="cursor-pointer bg-[#58AB4F] text-white hover:bg-green-800/50 rounded-full transition-all duration-200 hover:scale-105 text-sm sm:text-lg">
                  Get Started
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32 bg-blue-50"
        style={{ backgroundColor: "#eff6ff" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="sm:hidden text-3xl font-bold tracking-tight text-blue-900 leading-tight">
                Welcome to V.1.0 beta
              </div>
              <div className="hidden sm:block text-xs sm:text-sm font-medium text-blue-700 uppercase tracking-wide">
                YOUR SMART BEHAVIOR COMPANION
              </div>
              <div className="sm:hidden">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="rounded-full cursor-pointer bg-[#58AB4F] text-white hover:bg-green-800/50 text-lg px-8 py-6 min-h-[56px]"
                  >
                    Signin
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-900 leading-tight">
                The first nutrition app
                <br />
                focused on <span className="text-blue-600">adherence</span>,
                <br />
                not logging.
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-800 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We don't track failure — we prevent disengagement. Our smart
                system applies behavioral psychology at the moment of food
                decisions to help you stay consistent.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4">
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full cursor-pointer border-2 border-blue-900 hover:text-blue text-blue-900 hover:bg-blue-200 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 min-h-[56px] sm:min-h-[60px]"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-blue-800/90 max-w-xl mx-auto lg:mx-0">
                Try our beta free during the campaign. Backers get{" "}
                <span className="font-semibold">1 year of Premium for $89</span>
                . No card required to start — let AI predict your nutrition
                slips before they happen.
              </p>
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
              This is not a chatbot. It's a decision-support system that sees
              the slip coming and intervenes before it happens — inside an
              entire community built around adherence, not perfection.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* 1. Predictive AI Nudges */}
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-orange-500 text-white rounded-lg w-fit mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Predictive AI Nudges
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Our AI watches your real patterns — skipped breakfasts, Thursday
                crashes, late-night scrolling — then sends{" "}
                <span className="font-semibold">gentle, orange nudges</span>{" "}
                before the spiral starts. “Hey, this looks like last Thursday.
                Want a 2-minute win?”
              </p>
            </div>

            {/* 2. Emotional Support */}
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Emotional Support, Not Shame
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Voice tone, timing, and food patterns hint at stress. We respond
                with{" "}
                <span className="font-semibold">
                  psychology-informed recovery scripts
                </span>
                , not red alerts. “Okay, tonight shifted. Let&apos;s protect
                tomorrow together.”
              </p>
            </div>

            {/* 3. Meal Plans & Grocery Lists */}
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <ListChecks className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Meal Plans & Grocery Lists
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Turn your goals into{" "}
                <span className="font-semibold">real-world plans</span>. Auto
                generate simple meal plans and grocery lists that fit your
                schedule, budget, and protein targets — straight from the app.
              </p>
            </div>

            {/* 4. Community Hub */}
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Community Hub
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Join the{" "}
                <span className="font-semibold">ENTIRE NutritionCents community</span>{" "}
                — live Zoom classes, cooking sessions, support groups, and
                podcasts. You&apos;re not “going on a diet”; you&apos;re joining
                a practice.
              </p>
            </div>

            {/* 5. Wearable & Device Integration */}
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <Watch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Wearables, CGM & Offline Days
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Designed to plug into{" "}
                <span className="font-semibold">wearables and CGMs</span> as we
                grow — and still work when you vanish for three days. No guilt
                pings, just smart catch-up when you&apos;re ready.
              </p>
            </div>

            {/* 6. Research-Backed Insights */}
            <div className="p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-3 bg-blue-900 text-white rounded-lg w-fit mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Research-Backed Insights
              </h3>
              <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                Monthly graphs, habit streaks, and trends inspired by{" "}
                <span className="font-semibold">
                  elite diabetes and behavior research
                </span>
                . You don&apos;t just see macros — you see patterns that
                actually matter.
              </p>
            </div>
          </div>

          {/* Community + Kickstarter tie-in */}
          <div className="mt-12 sm:mt-16 max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900">
              The NutritionCents Community
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-blue-800 leading-relaxed max-w-3xl mx-auto">
              Live coaching, Zoom cooking nights, peer support channels, podcast
              drops, and challenges that reward{" "}
              <span className="font-semibold">consistency</span> over
              perfection. Earn badges for streaks, recovery days, and “Thursday
              saves” — not just for eating salad.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-left text-sm sm:text-base">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-blue-900">
                    Live Coaching
                  </span>
                </div>
                <p className="text-blue-800 text-sm">
                  Weekly group calls and Q&amp;A to troubleshoot your real
                  schedule and roadblocks.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  <span className="font-semibold text-blue-900">
                    Zoom Cooking & Workshops
                  </span>
                </div>
                <p className="text-blue-800 text-sm">
                  Learn fast meals, grocery shortcuts, and “damage-control”
                  strategies you&apos;ll actually use.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-blue-900">
                    Gamified Progress
                  </span>
                </div>
                <p className="text-blue-800 text-sm">
                  Earn badges for consistency, recovery days, and checking in
                  when life gets messy — not for being perfect.
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-blue-900 font-medium">
              <span className="font-semibold">
                Back our Kickstarter to unlock early access
              </span>{" "}
              to the community, live events, and founder-led onboarding.
            </p>
            <p className="text-xs sm:text-sm text-blue-700">
              “Early beta user: <span className="italic">
                Finally, an app that actually understands my Thursdays.
              </span>
              ”
            </p>
          </div>
        </div>
      </section>

      {/* Core Functions */}
      <section
        id="services"
        className="py-12 sm:py-16 lg:py-24 bg-blue-50"
        style={{ backgroundColor: "#eff6ff" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
              Everything You Need to Track
            </h2>
            <p className="text-base sm:text-lg text-blue-800 max-w-3xl mx-auto px-4 leading-relaxed">
              This is table stakes. Your advantage starts after this — but we
              still give you a clean, powerful engine.
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
                    Text logging, voice logging, food image recognition, and
                    barcode scanning. Log however works for you — earn small
                    points for simply checking in.
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
                    Macros, micros, custom goals (fat loss, muscle gain,
                    health), and weekly &amp; monthly trends — with summaries
                    focused on{" "}
                    <span className="font-semibold">“What to do next”</span>,
                    not just what you did wrong.
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
                    Macro breakdown, weekly consistency graph, protein &amp;
                    water focus indicators, and trend arrows with{" "}
                    <span className="font-semibold">
                      gentle, color-coded nudges
                    </span>{" "}
                    (green when you&apos;re on track, orange when it&apos;s time
                    to course-correct).
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
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-blue-800 max-w-3xl mx-auto px-4 leading-relaxed">
              A simple onboarding flow designed to{" "}
              <span className="font-semibold">
                predict where you&apos;ll slip
              </span>{" "}
              — then support you before it happens.
            </p>
          </div>

          {/* Onboarding / flow steps */}
          <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {[
                {
                  step: "01",
                  title: "Welcome & Intent",
                  body: "Share your goals in plain language: lose fat, stabilize energy, support diabetes, or just feel better in your clothes."
                },
                {
                  step: "02",
                  title: "Profile & Baseline",
                  body: "We collect basics (age, weight, movement, meds) and your typical week — not just macros."
                },
                {
                  step: "03",
                  title: "Behavior & Triggers",
                  body: "Identify your danger zones: late nights, weekends, travel, stress days. This trains our prediction engine."
                },
                {
                  step: "04",
                  title: "Goals & Guardrails",
                  body: "Set flexible targets (protein, calories, CGM range). We build a plan that expects real life, not perfection."
                },
                {
                  step: "05",
                  title: "Daily Check-ins",
                  body: "Log with text, voice, images, or barcode. Short nudges keep you on track without nagging."
                },
                {
                  step: "06",
                  title: "Predictive Nudges",
                  body: "As patterns emerge, the app nudges you before your usual slips with fast options you&apos;ll actually do."
                },
                {
                  step: "07",
                  title: "Gamified Wins",
                  body: "Earn points, streaks, and badges for consistency and recovery days, not just for perfect logging."
                },
                {
                  step: "08",
                  title: "Community & Coaching",
                  body: "Join live sessions, get feedback, and stay engaged with people solving the same problems you are."
                }
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6 sm:p-7 bg-blue-50 border border-blue-100 rounded-lg flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Thursday example */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 text-center">
              A Real Thursday Example
            </h3>
            <div className="space-y-6 sm:space-y-8">
              <div className="p-6 sm:p-8 bg-blue-50 border-l-4 border-blue-900 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-900 text-white rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">
                      Day 23: Thursday 6pm
                    </h4>
                    <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-3">
                      You skipped breakfast. Protein is low. Past pattern
                      detected: takeout binge risk.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <p className="text-sm sm:text-base text-blue-900 font-medium italic">
                        &quot;Hey — Thursdays are usually tough. Want a fast
                        protein win or a &apos;damage-control&apos; dinner?&quot;
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-2">
                        No macros. No guilt. Just help.
                      </p>
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
                    <h4 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">
                      Later That Night
                    </h4>
                    <p className="text-sm sm:text-base text-blue-800 leading-relaxed mb-3">
                      You ate pizza. You logged it.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <p className="text-sm sm:text-base text-blue-900 font-medium italic">
                        &quot;Okay. Let&apos;s switch to recovery mode. One
                        glass of water + normal dinner tomorrow.&quot;
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mt-2">
                        No streak loss. No red alerts. You feel safe. You stay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Image Section */}
      <section
        className="py-8 sm:py-12 lg:py-16 bg-blue-50"
        style={{ backgroundColor: "#eff6ff" }}
      >
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
      <section
        id="comparison"
        className="py-12 sm:py-16 lg:py-24 bg-blue-50"
        style={{ backgroundColor: "#eff6ff" }}
      >
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
                      { feature: "Smart Intervention Timing", others: false, us: true, highlight: true },
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

      {/* Kickstarter Funnel Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 px-4">
              Back the Kickstarter. Build the Future of Adherence.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-800 max-w-3xl mx-auto leading-relaxed">
              We&apos;re using this campaign to{" "}
              <span className="font-semibold">
                polish the app, expand our research, and grow the community
              </span>{" "}
              that helps people stay engaged when life gets messy.
            </p>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 text-left max-w-4xl mx-auto">
              <div className="p-6 sm:p-7 rounded-lg bg-blue-50 border border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
                  Backer Perks (Examples)
                </h3>
                <ul className="list-disc list-inside text-sm sm:text-base text-blue-800 space-y-2">
                  <li>
                    <span className="font-semibold">$89 Tier:</span> 1 year of
                    NutritionCents Premium + early beta access.
                  </li>
                  <li>
                    <span className="font-semibold">$175 Tier:</span> 2 years
                    Premium +{" "}
                    <span className="font-semibold">
                      1:1 coaching call with the founding team
                    </span>
                    .
                  </li>
                  <li>
                    Founder-only Q&amp;A sessions, behind-the-scenes roadmap,
                    and community badges for early supporters.
                  </li>
                </ul>
              </div>
              <div className="p-6 sm:p-7 rounded-lg bg-blue-50 border border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
                  How We&apos;ll Use the Funds
                </h3>
                <ul className="list-disc list-inside text-sm sm:text-base text-blue-800 space-y-2">
                  <li>$25k – App polish, stability, and wearable integrations.</li>
                  <li>$15k – Community content, live coaching, and production.</li>
                  <li>$10k – Marketing, research collaborations, and outreach.</li>
                </ul>
              </div>
            </div>
            <p className="text-sm sm:text-base text-orange-600 font-semibold">
              Campaign launches March 9 and ends April 13 —{" "}
              <span className="underline">don&apos;t miss your founder pricing</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-12 sm:py-16 lg:py-24 bg-blue-900 text-white"
        style={{ backgroundColor: "#1e3a8a" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 leading-tight">
            Ready for a Companion That Sees the Slip Coming?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-50 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            Join users who stay consistent because their smart companion prevents disengagement, not just tracks food.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 items-stretch sm:items-center">
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer rounded-full w-full sm:w-auto border-2 border-white text-white hover:bg-blue-900 hover:text-white text-base text-[#1e3a8a] sm:text-lg px-6 sm:px-8 py-6 sm:py-7 min-h-[56px] sm:min-h-[60px]"
                style={{ borderColor: "#ffffff" }}
              >
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm sm:text-base text-blue-200 mt-6 sm:mt-8 max-w-xl mx-auto px-4">
            No credit card required to join the beta. Help us build the app
            that finally understands your real life.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-slate-900 text-slate-300 py-8 sm:py-12"
        style={{ backgroundColor: "#0f172a", color: "#cbd5e1" }}
      >
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
                The first nutrition app focused on adherence, not logging. Your smart behavior companion.
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

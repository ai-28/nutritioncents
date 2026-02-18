import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Brain,
  BarChart3,
  BookOpen,
  Users,
  CheckCircle2
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
              <Link href="#features" className="text-sm font-medium text-white hover:text-blue-200 transition-all duration-200 hover:scale-105">
                Features
              </Link>
              <Link href="#services" className="text-sm font-medium text-white hover:text-blue-200 transition-all duration-200 hover:scale-105">
                Services
              </Link>
              <Link href="#comparison" className="text-sm font-medium text-white hover:text-blue-200 transition-all duration-200 hover:scale-105">
                Why Us
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-white hover:text-blue-200 hover:bg-blue-800/50 transition-all duration-200 hover:scale-105 text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-white text-blue-900 hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm px-3 sm:px-4">
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
                HOW IT WORKS
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-900 leading-tight">
                Real science.
                <br />
                Real people.
                <br />
                Real results.
              </h1>
              <p className="text-base sm:text-lg text-blue-800 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Lose up to 3.5x more weight with our AI-powered Program than with standard nutritional guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white text-base sm:text-lg px-8 py-6 sm:py-7">
                    Find your plan
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
      <section id="features" className="py-12 sm:py-16 lg:py-24 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
              What Makes Us Different
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-blue-800 max-w-3xl mx-auto px-4 leading-relaxed">
              Unlike typical calorie-counting apps, NutritionCents delivers comprehensive nutrition intelligence through an AI-powered dashboard generating complete daily and weekly intake reports. We're not just tracking what you eat—we're predicting what you need and guiding you toward optimal health outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Comprehensive Services */}
      <section id="services" className="py-12 sm:py-16 lg:py-24 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4 px-4">
              Comprehensive Services & Subscription Benefits
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="p-6 sm:p-8 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-900 text-white rounded-lg flex-shrink-0">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    AI-Powered Intelligence
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Personalized nutrition insights delivered through advanced algorithms that learn your preferences, adapt to your lifestyle, and predict your needs
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
                    Complete Tracking Dashboard
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Real-time nutrition monitoring with daily, weekly, and monthly reports benchmarked against your personal health goals
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-900 text-white rounded-lg flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Educational Content
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Access to expert-led cooking classes, nutrition workshops, and evidence-based content exposing the dangers of processed foods
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-900 text-white rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">
                    Supportive Community
                  </h3>
                  <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
                    Thriving ecosystem of like-minded individuals, weekly support groups, podcasts, and longevity-focused discussions
                  </p>
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
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12 lg:mb-16">
            <div className="bg-white p-6 sm:p-8 border border-blue-200 rounded-lg">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2 sm:mb-3">7x</h3>
              <p className="text-sm sm:text-base text-blue-800">
                Members are 7x more likely to achieve 10% weight loss than others following standard nutritional guidance
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 border border-blue-200 rounded-lg">
              <h3 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2 sm:mb-3">72%</h3>
              <p className="text-sm sm:text-base text-blue-800">
                Agree NutritionCents made them more optimistic about the future of their weight health.
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-4 sm:p-6 lg:p-8 border border-blue-200 rounded-lg overflow-hidden">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">
                How We Compare
              </h3>
              <div className="space-y-3 sm:space-y-4 overflow-x-auto">
                {[
                  { feature: "AI-Powered Nutrition Intelligence", us: true, others: false },
                  { feature: "Complete Daily & Weekly Reports", us: true, others: "Limited" },
                  { feature: "Predictive Health Insights", us: true, others: false },
                  { feature: "Educational Content & Workshops", us: true, others: false },
                  { feature: "Community Support Groups", us: true, others: "Basic" },
                  { feature: "Personalized Goal Tracking", us: true, others: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg min-w-[600px] sm:min-w-0">
                    <span className="font-medium text-blue-900 text-sm sm:text-base flex-shrink-0">{item.feature}</span>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-blue-700 whitespace-nowrap">Others</span>
                        {item.others === true ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                        ) : item.others === false ? (
                          <span className="text-blue-400 text-sm sm:text-base">✗</span>
                        ) : (
                          <span className="text-xs sm:text-sm text-amber-600 whitespace-nowrap">{item.others}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-blue-900 whitespace-nowrap">NutritionCents</span>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-24 bg-blue-900 text-white" style={{ backgroundColor: '#1e3a8a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4 leading-tight">
            Ready to Transform Your Nutrition Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-50 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            Join thousands of users achieving their health goals with AI-powered nutrition intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7" style={{ backgroundColor: '#ffffff', color: '#1e3a8a' }}>
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 hover:text-white text-base text-[#1e3a8a] sm:text-lg px-6 sm:px-8 py-6 sm:py-7" style={{ borderColor: '#ffffff'}}>
                Schedule Demo
              </Button>
            </Link>
          </div>
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
                AI-powered nutrition intelligence for optimal health outcomes.
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

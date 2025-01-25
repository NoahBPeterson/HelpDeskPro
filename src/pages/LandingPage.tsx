import { CheckCircle, MessageSquare, Shield, BarChart, Globe, LifeBuoy } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-y-auto">
      <nav className="px-4 py-4 border-b border-blue-100">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">HelpDesk Pro</h1>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Customer Support Software
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your customer service with AI-powered ticketing, 
            team collaboration, and actionable insights.
          </p>
          
          <div className="flex justify-center gap-4 mb-20">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Smart Ticketing</h3>
              <p className="text-gray-600">
                AI-powered ticket routing and automated responses reduce 
                resolution times by 40% on average.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
              <p className="text-gray-600">
                Internal notes, @mentions, and real-time updates keep 
                your team aligned on complex issues.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Analytics</h3>
              <p className="text-gray-600">
                Real-time dashboards and SLA tracking help you maintain 
                service quality and accountability.
              </p>
            </div>
          </div>
        </div>

          {/* New feature grid */}
          <section className="py-16 bg-white border-t border-blue-50">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Complete Help Desk Solution</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: <CheckCircle className="w-6 h-6" />, title: "SLA Management", text: "Automated escalation paths for critical tickets" },
                  { icon: <MessageSquare className="w-6 h-6" />, title: "Omnichannel Support", text: "Email, chat, social media in one unified inbox" },
                  { icon: <Shield className="w-6 h-6" />, title: "Security", text: "SOC2 compliant data protection with RBAC" },
                  { icon: <BarChart className="w-6 h-6" />, title: "Custom Reports", text: "Build dashboards with 50+ prebuilt metrics" },
                  { icon: <Globe className="w-6 h-6" />, title: "Multi-language", text: "Support 25+ languages with AI translation" },
                  { icon: <LifeBuoy className="w-6 h-6" />, title: "24/7 Support", text: "Enterprise-grade technical support team" }
                ].map((feature, idx) => (
                  <div key={idx} className="p-6 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span className="cursor-default">Features</span></li>
                <li><span className="cursor-default">Pricing</span></li>
                <li><span className="cursor-default">Security</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span className="cursor-default">About</span></li>
                <li><span className="cursor-default">Blog</span></li>
                <li><span className="cursor-default">Careers</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span className="cursor-default">Documentation</span></li>
                <li><span className="cursor-default">System Status</span></li>
                <li><span className="cursor-default">Contact</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span className="cursor-default">Privacy</span></li>
                <li><span className="cursor-default">Terms</span></li>
                <li><span className="cursor-default">GDPR</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 HelpDesk Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
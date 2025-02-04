import { CheckCircle, MessageSquare, Shield, BarChart, Globe, LifeBuoy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export function LandingPage() {
  // Add background color to body when component mounts
  useEffect(() => {
    // Save the original background color
    const originalBg = document.body.style.backgroundColor;
    
    // Set the background color
    document.body.style.backgroundColor = '#312e81'; // indigo-900
    
    // Cleanup function to restore original background when component unmounts
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 overflow-y-auto relative">
      <nav className="sticky top-0 z-50 px-4 py-4 bg-indigo-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text">
            HelpDesk Pro
          </h1>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="text-purple-200 hover:text-white font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-400 transition-colors shadow-lg shadow-purple-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Modern Customer Support Software
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Streamline your customer service with AI-powered ticketing, 
            team collaboration, and actionable insights.
          </p>
          
          <div className="flex justify-center gap-4 mb-20">
            <Link
              to="/register"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-lg text-lg hover:from-purple-400 hover:to-indigo-400 transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-colors">
              <h3 className="text-xl font-semibold mb-4 text-purple-200">Workflow Automation</h3>
              <p className="text-purple-100/80">
                Smart routing rules and automated assignments help 
                reduce response times and balance team workload.
              </p>
            </div>
            
            <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-colors">
              <h3 className="text-xl font-semibold mb-4 text-purple-200">Team Collaboration</h3>
              <p className="text-purple-100/80">
                Internal notes, @mentions, and real-time updates keep 
                your team aligned on complex issues.
              </p>
            </div>
            
            <div className="p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 hover:bg-white/20 transition-colors">
              <h3 className="text-xl font-semibold mb-4 text-purple-200">Analytics</h3>
              <p className="text-purple-100/80">
                Real-time dashboards and SLA tracking help you maintain 
                service quality and accountability.
              </p>
            </div>
          </div>
        </div>

        {/* New feature grid */}
        <section className="py-16 mt-16 bg-black/20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">Complete Help Desk Solution</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <CheckCircle className="w-6 h-6" />, title: "SLA Management", text: "Automated escalation paths for critical tickets" },
                { icon: <MessageSquare className="w-6 h-6" />, title: "Omnichannel Support", text: "Email, chat, social media in one unified inbox" },
                { icon: <Shield className="w-6 h-6" />, title: "Security", text: "SOC2 compliant data protection with RBAC" },
                { icon: <BarChart className="w-6 h-6" />, title: "Custom Reports", text: "Build dashboards with 50+ prebuilt metrics" },
                { icon: <Globe className="w-6 h-6" />, title: "Multi-language", text: "Support 25+ languages with AI translation" },
                { icon: <LifeBuoy className="w-6 h-6" />, title: "24/7 Support", text: "Enterprise-grade technical support team" }
              ].map((feature, idx) => (
                <div key={idx} className="p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-purple-200">{feature.title}</h3>
                  </div>
                  <p className="text-purple-100/80">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 text-white mt-20 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-purple-200">Product</h4>
              <ul className="space-y-2 text-purple-100/80">
                <li><span className="cursor-default hover:text-white transition-colors">Features</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">Pricing</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">Security</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-purple-200">Company</h4>
              <ul className="space-y-2 text-purple-100/80">
                <li><span className="cursor-default hover:text-white transition-colors">About</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">Blog</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">Careers</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-purple-200">Resources</h4>
              <ul className="space-y-2 text-purple-100/80">
                <li><span className="cursor-default hover:text-white transition-colors">Documentation</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">System Status</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">Contact</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-purple-200">Legal</h4>
              <ul className="space-y-2 text-purple-100/80">
                <li><span className="cursor-default hover:text-white transition-colors">Privacy</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">Terms</span></li>
                <li><span className="cursor-default hover:text-white transition-colors">GDPR</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-purple-200/60">
            <p>© 2024 HelpDesk Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
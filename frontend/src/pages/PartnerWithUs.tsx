import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChefHat, TrendingUp, Globe, ArrowRight,
  CheckCircle, ChevronDown, Users, Building2, ShoppingCart,
  DollarSign, Clock, Star, Zap, BarChart3,
} from "lucide-react";

const PartnerWithUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6 border border-emerald-500/30">
                <Zap className="h-4 w-4" /> Now Accepting Partners
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Grow Your Restaurant
                <span className="block text-emerald-400">with GlobalEats</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Reach thousands of hungry customers, get real-time analytics, manage multi-brand operations
                — all from one powerful vendor dashboard. Zero upfront costs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/vendor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl text-lg font-semibold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25">
                  Register as Partner <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl text-lg font-medium hover:bg-white/10 transition-all">
                  Learn More
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Building2, value: "50+", label: "Restaurant Brands" },
              { icon: Globe, value: "10+", label: "Cities Served" },
              { icon: ShoppingCart, value: "1000+", label: "Daily Orders" },
              { icon: Users, value: "25K+", label: "Happy Customers" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center">
                <stat.icon className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From registration to your first order — get set up in under 24 hours
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01", icon: Users, title: "Register",
                desc: "Fill out a quick form with your business details, GST, FSSAI, and bank info.",
                color: "emerald",
              },
              {
                step: "02", icon: CheckCircle, title: "Get Approved",
                desc: "Our team reviews your application and approves within 24 hours.",
                color: "blue",
              },
              {
                step: "03", icon: ChefHat, title: "Set Up Menu",
                desc: "Add your brands, outlets, and menu items. Set your own prices.",
                color: "orange",
              },
              {
                step: "04", icon: ShoppingCart, title: "Start Selling",
                desc: "Go live and start receiving orders. Track everything in real-time.",
                color: "purple",
              },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all group">
                <div className="text-5xl font-bold text-gray-100 absolute top-4 right-4 group-hover:text-emerald-100 transition-colors">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center mb-4`}>
                  <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Partner With Us?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to scale your food business, built into one platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Zero Upfront Cost",
                desc: "No setup fees, no subscription. You only pay a small commission on successful orders. Start risk-free.",
                highlight: "15% commission on orders",
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                desc: "Full vendor dashboard with live order tracking, revenue analytics, and performance insights to grow your business.",
                highlight: "Track every metric",
              },
              {
                icon: Building2,
                title: "Multi-Brand Support",
                desc: "Run multiple brands from different outlets — cloud kitchens, restaurants, cafes. One account manages everything.",
                highlight: "Unlimited brands & outlets",
              },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all border border-gray-100 hover:border-emerald-200 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:bg-emerald-500 transition-colors">
                  <item.icon className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle className="h-4 w-4" /> {item.highlight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Your Vendor Dashboard
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                A dedicated dashboard built specifically for food businesses. Manage everything from one place.
              </p>
              <div className="space-y-4">
                {[
                  { icon: ShoppingCart, text: "Real-time order management with live status updates" },
                  { icon: ChefHat, text: "Easy menu builder — add items, set prices, manage availability" },
                  { icon: Building2, text: "Multi-outlet management — expand to multiple locations" },
                  { icon: TrendingUp, text: "Revenue & performance analytics at your fingertips" },
                  { icon: Clock, text: "Order history and complete financial reporting" },
                  { icon: Star, text: "Customer insights to improve your offerings" },
                ].map((feature, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-gray-700">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
                {/* Mock dashboard preview */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Vendor Dashboard</p>
                    <p className="text-xs text-gray-400">Your restaurant hub</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">₹2.4L</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">847</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">12</p>
                    <p className="text-xs text-gray-500">Menu Items</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">4.8★</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {["Paneer Tikka · #1049", "Chicken Biryani · #1048", "Masala Dosa · #1047"].map((order, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                      <span className="text-gray-700">{order}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>{i === 0 ? "Preparing" : i === 1 ? "Ready" : "Delivered"}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative blur */}
              <div className="absolute -z-10 top-8 left-8 w-full h-full bg-emerald-200/50 rounded-2xl blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-500">Everything you need to know before getting started</p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "What is the commission rate?",
                a: "We charge a 15% commission on delivered orders. No setup fees, no monthly charges. You only pay when you earn.",
              },
              {
                q: "How long does approval take?",
                a: "Most applications are reviewed and approved within 24 hours during business days. We'll notify you via email.",
              },
              {
                q: "What documents do I need to register?",
                a: "You'll need your FSSAI license number, GST number (optional for small businesses), PAN, and bank account details for payouts.",
              },
              {
                q: "Can I manage multiple brands from one account?",
                a: "Yes! GlobalEats supports multi-brand operations. You can run different restaurant concepts from different outlets, all managed from a single vendor dashboard.",
              },
              {
                q: "How do I receive payments?",
                a: "Payments are processed weekly and deposited directly to your registered bank account. You can track all transactions from your dashboard.",
              },
              {
                q: "Can I update my menu anytime?",
                a: "Absolutely. Add or remove items, change prices, mark items as unavailable — all in real-time from your vendor dashboard.",
              },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
            <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join GlobalEats today and start reaching thousands of new customers. Registration takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vendor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg">
                Register Now <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="mailto:partners@globaleats.com" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-xl text-lg font-medium hover:bg-white/10 transition-all">
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-6 py-4 text-left">
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default PartnerWithUs;

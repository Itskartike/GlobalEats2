import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Handshake, Heart, Instagram, Twitter, Facebook } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 pb-20 md:pb-0">
      {/* Enhanced Newsletter Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left max-w-xl">
              <h3 className="text-2xl font-bold text-white mb-2">Subscribe & get ₹100 off your next order 🍕</h3>
              <p className="text-gray-400 text-sm">Join our newsletter for exclusive restaurant deals, secrets, and VIP invites. No spam. Unsubscribe anytime.</p>
            </div>
            <div className="w-full lg:w-auto max-w-md w-full">
              <div className="relative flex items-center bg-gray-900 rounded-full border border-gray-700/50 p-1.5 focus-within:ring-2 focus-within:ring-orange-500/50 focus-within:border-orange-500 transition-all shadow-inner">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 w-full px-5 py-3 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                />
                <button className="px-7 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold rounded-full hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-lg">G</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Global<span className="text-orange-500">Eats</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 font-medium">
              Your favorite meals from the best local restaurants, delivered fast.
              Premium multi-brand food marketplace built for food lovers.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#", hoverClass: "hover:bg-pink-600 hover:text-white" },
                { icon: Twitter, href: "#", hoverClass: "hover:bg-blue-400 hover:text-white" },
                { icon: Facebook, href: "#", hoverClass: "hover:bg-blue-600 hover:text-white" },
              ].map(({ icon: Icon, href, hoverClass }, i) => (
                <a key={i} href={href} className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 group ${hoverClass}`}>
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/restaurants" className="text-sm hover:text-orange-400 transition-colors">Restaurants</Link></li>
              <li><Link to="/offers" className="text-sm hover:text-orange-400 transition-colors">Offers & Deals</Link></li>
              <li><Link to="/track-order" className="text-sm hover:text-orange-400 transition-colors">Track Order</Link></li>
              <li>
                <Link to="/partner" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Handshake className="w-3.5 h-3.5" />
                  Become a Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-sm hover:text-orange-400 transition-colors">Help Center</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-orange-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund" className="text-sm hover:text-orange-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  GlobalEats Headquarters<br/>
                  Mumbai, Maharashtra, India
                </span>
              </li>
              <li>
                <a href="tel:+911234567890" className="flex items-center gap-3 group">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">+91 1234-567-890</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@globaleats.com" className="flex items-center gap-3 group">
                  <Mail className="w-5 h-5 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">support@globaleats.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
            <p>© {new Date().getFullYear()} GlobalEats Inc. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Designed & Developed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
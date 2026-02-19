import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Handshake, ChefHat, Instagram, Twitter, Facebook } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400 pb-20 md:pb-0">
      {/* Newsletter Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-1">Stay hungry, stay updated</h3>
              <p className="text-sm text-gray-500">Get exclusive deals and new restaurant alerts</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
              />
              <button className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap">
                Subscribe
              </button>
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
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-white">
                Global<span className="text-orange-400">Eats</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              Your favorite meals from the best local restaurants, delivered fast.
              Multi-brand food marketplace built for food lovers.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Facebook, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 group">
                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
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
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span className="text-sm">Mumbai, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="text-sm">+91 1234-567-890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="text-sm">support@globaleats.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} GlobalEats. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <ChefHat className="w-3.5 h-3.5 text-orange-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
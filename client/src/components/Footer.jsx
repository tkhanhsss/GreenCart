import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaGithub } from "react-icons/fa";
import { assets } from '../assets/assets.js'
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <img src={assets.logo} alt="logo" className="h-10 brightness-0 invert mb-4" />
            <p className="text-sm leading-relaxed text-gray-500">
              Your trusted source for fresh, quality groceries delivered right to your door.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: <FaFacebookF />, href: '#', color: 'hover:text-blue-400' },
                { icon: <FaInstagram />, href: '#', color: 'hover:text-pink-400' },
                { icon: <FaTwitter />, href: '#', color: 'hover:text-sky-400' },
                { icon: <FaLinkedinIn />, href: '#', color: 'hover:text-blue-300' },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  className={`w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-sm ${s.color} hover:border-current transition-all duration-200`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</p>
            <ul className="space-y-2.5 text-sm">
              {[{ label: 'Home', to: '/' }, { label: 'All Products', to: '/products' }, { label: 'My Orders', to: '/my-orders' }].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</p>
            <ul className="space-y-2.5 text-sm">
              {['FAQ', 'Return Policy', 'Shipping Info', 'Contact Us'].map(l => (
                <li key={l}><a href="#" className="hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Contact</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                it.tungkhanh@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                0945600828
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 px-6 py-5 text-center text-xs text-gray-600">
        Copyright © 2025{" "}
        <a href="#" className="text-primary hover:underline">GreenCart</a>. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
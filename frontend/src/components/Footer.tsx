"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import logo from '../images/main.png';
import Image from 'next/image';
import {
  Facebook, Twitter, Instagram, Heart, ExternalLink, Home, Users, MessageSquareMore, Store, MessageSquare
} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { subscribeToNewsletter } from '@/utils/newsletter/email';
// import { subscribeToNewsletter } from '@/lib/newsletter'; // Uncomment and implement if needed

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const companyName = 'VeSoko';

  // Newsletter subscription state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle newsletter subscription (dummy for now)
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      await subscribeToNewsletter(email);
      setMessage('Successfully subscribed! Check your email for confirmation.');
      setIsSuccess(true);
      setEmail('');
    } catch (error: any) {
      setMessage('Failed to subscribe. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const quickLinks = [
    { label: 'Home', href: '/', icon: <Home className='h-4 w-4' /> },
    { label: 'About', href: '/about', icon: <Users className='h-4 w-4' /> },
    { label: 'Sell', href: '/sellers', icon: <Store className='h-4 w-4' /> },
    { label: 'FAQ', href: '/faq', icon: <MessageSquareMore className='h-4 w-4' /> },
    { label: 'Contact', href: '/contact', icon: <MessageSquare className='h-4 w-4' /> },
  ];

  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com/vesoko', icon: <Facebook className='h-5 w-5' /> },
    { label: 'X (Twitter)', href: 'https://twitter.com/vesoko', icon: <Twitter className='h-5 w-5' /> },
    { label: 'Instagram', href: 'https://instagram.com/vesoko', icon: <Instagram className='h-5 w-5' /> },
    { label: 'TikTok', href: 'https://tiktok.com/@vesoko', icon: <FaTiktok className='h-5 w-5' /> },
  ];

  return (
    <footer className="bg-gradient-to-r from-vesoko_dark_blue via-vesoko_light_blue to-vesoko_dark_blue text-[#3d1f00] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:justify-between md:items-center gap-8">
        {/* Logo & Social */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="VeSoko Logo" width={48} height={48} className="w-12 h-12 object-contain" />
            <span className="text-xl font-bold text-[#3d1f00]">VeSoko</span>
          </div>
          <div className="flex gap-2 mt-1">
            {socialLinks.map((social, idx) => (
              <Link key={idx} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer"
                className="p-2 bg-white/10 hover:bg-[#ff7a00] rounded-full transition-all duration-300 hover:scale-110 text-[#3d1f00] hover:text-white">
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-xl font-bold text-[#3d1f00]">Quick Links</span>
          <div className="flex gap-4">
            {quickLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="flex items-center gap-1 text-[#3d1f00] hover:text-[#ff7a00] text-sm font-semibold transition-colors drop-shadow-sm"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        {/* Newsletter */}
        <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-auto max-w-xs">
          <span className="text-xl font-bold text-[#3d1f00]">Stay Updated</span>
          <form onSubmit={handleNewsletterSubmit} className="flex w-full gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-[#3d1f00] placeholder-[#3d1f00]/60 focus:outline-none focus:ring-2 focus:ring-[#ff7a00] focus:border-transparent transition-all text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !email}
              className="bg-[#ff7a00] hover:bg-[#3d1f00] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : 'Subscribe'}
            </button>
          </form>
          {message && (
            <span className={`text-xs mt-1 ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>{message}</span>
          )}
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-vesoko_dark_blue/80 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-[#3d1f00] text-xs">© {currentYear} {companyName}. All rights reserved.</span>
          <div className="flex items-center gap-1 text-[#3d1f00] text-xs">
            <span>Developed with</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>by</span>
            <Link
              href="https://www.clasona.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff7a00] hover:text-[#3d1f00] font-medium ml-1 flex items-center gap-1"
            >
              Clasona
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


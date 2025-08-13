import React, { useState } from 'react';
import { 
  Crown, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  Sparkles,
  Bell,
  Mail,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { subscribeToNewsletter } from '@/utils/newsletter/email';

interface PremiumFeatureComingSoonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  comingSoonDate?: string;
  phase?: string;
  gradient?: string;
  iconBg?: string;
}

const PremiumFeatureComingSoon: React.FC<PremiumFeatureComingSoonProps> = ({
  title,
  description,
  icon,
  features,
  comingSoonDate = "Q2 2025",
  phase = "Phase 2",
  gradient = "from-blue-600 to-indigo-700",
  iconBg = "from-blue-500 to-indigo-600"
}) => {
  // Notification subscription state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle notification subscription
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      // Subscribe to newsletter with a tag for this specific feature
      await subscribeToNewsletter(email);
      setMessage(`Great! We'll notify you when ${title} launches.`);
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
  return (
    <div className='space-y-8'>
      {/* Header Section */}
      <div className='text-center'>
        <div className='inline-flex items-center gap-4 mb-6'>
          <div className={`w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg`}>
            <Crown className='w-8 h-8 text-white' />
          </div>
          <div className={`w-16 h-16 bg-gradient-to-br ${iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
        </div>
        
        <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
          {title}
          <span className='ml-3 inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg font-medium rounded-full'>
            <Crown className='w-4 h-4' />
            PRO
          </span>
        </h1>
        
        <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
          {description}
        </p>
        
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
          <div className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl font-semibold text-lg shadow-lg`}>
            <Clock className='w-5 h-5' />
            Coming {comingSoonDate}
          </div>
          
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium'>
            <Sparkles className='w-4 h-4' />
            {phase}
          </div>
        </div>
      </div>

      {/* Current State Notice */}
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle2 className='w-8 h-8 text-blue-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Currently Available Features
          </h2>
          <p className='text-gray-600 mb-6'>
            While this premium feature is in development, you have access to all current platform capabilities.
          </p>
          <Link 
            href='/retailer'
            className='inline-flex items-center gap-2 px-6 py-3 bg-vesoko_green_500 hover:bg-vesoko_green_600 text-white rounded-lg font-semibold transition-colors duration-200'
          >
            <ArrowUpRight className='w-4 h-4' />
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Preview */}
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center'>
            <Sparkles className='w-5 h-5 text-white' />
          </div>
          <h3 className='text-2xl font-bold text-gray-900'>What&apos;s Coming</h3>
        </div>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <h4 className='text-lg font-semibold text-gray-900 mb-4'>Key Features</h4>
            <ul className='space-y-3'>
              {features.map((feature, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mt-2 flex-shrink-0'></div>
                  <span className='text-gray-700'>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className='bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6'>
            <h4 className='text-lg font-semibold text-gray-900 mb-4'>Benefits</h4>
            <ul className='space-y-2 text-sm text-gray-600'>
              <li>• Increase business efficiency</li>
              <li>• Save time with automation</li>
              <li>• Boost customer engagement</li>
              <li>• Drive more sales and revenue</li>
              <li>• Get actionable insights</li>
              <li>• Stay ahead of competition</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notification Signup */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl shadow-2xl p-8 text-center text-white`}>
        <Crown className='w-16 h-16 mx-auto mb-6 text-yellow-300' />
        
        <h2 className='text-3xl font-bold mb-4'>
          Be the First to Know
        </h2>
        
        <p className='text-xl opacity-90 mb-8 max-w-2xl mx-auto'>
          Get notified when {title.toLowerCase()} launches and unlock powerful new capabilities for your business.
        </p>
        
        <form onSubmit={handleNotificationSubmit} className='flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto'>
          <div className='flex-1 w-full'>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              className='w-full px-4 py-3 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 placeholder-gray-500'
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading || !email}
            className='px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 shadow-lg flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Bell className='w-4 h-4' />
            {isLoading ? 'Subscribing...' : 'Notify Me'}
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
            isSuccess 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Support Links */}
      <div className='grid sm:grid-cols-2 gap-6'>
        <Link 
          href='/retailer/support'
          className='bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-white/20 hover:shadow-lg transition-all duration-200 group'
        >
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Contact Support</h4>
              <p className='text-sm text-gray-600'>Have questions? We&apos;re here to help!</p>
            </div>
            <ExternalLink className='w-5 h-5 text-gray-400 group-hover:text-gray-600' />
          </div>
        </Link>
        
        <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-white/20'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-gray-900 mb-2'>Newsletter</h4>
              <p className='text-sm text-gray-600'>Stay updated on all new features</p>
            </div>
            <Mail className='w-5 h-5 text-gray-400' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureComingSoon;

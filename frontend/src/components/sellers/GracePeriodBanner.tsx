import React from 'react';
import { Clock, Gift, AlertTriangle } from 'lucide-react';

interface GracePeriodBannerProps {
  inGracePeriod: boolean;
  daysRemaining: number;
  gracePeriodEnd?: Date;
  platformFeePercentage?: number;
}

const GracePeriodBanner: React.FC<GracePeriodBannerProps> = ({
  inGracePeriod,
  daysRemaining,
  gracePeriodEnd,
  platformFeePercentage = 10
}) => {
  if (!inGracePeriod) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-blue-900 font-semibold">Platform Fees Active</h3>
            <p className="text-blue-800 text-sm mt-1">
              Platform fees ({platformFeePercentage}%) are now being deducted from your sales. 
              This fee helps us maintain the marketplace and provide you with ongoing support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (daysRemaining <= 2) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-amber-900 font-semibold">Platform Fees Starting Soon</h3>
            <p className="text-amber-800 text-sm mt-1">
              Your grace period ends in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>.
              {gracePeriodEnd && (
                <span> Platform fees ({platformFeePercentage}%) will apply starting {gracePeriodEnd.toLocaleDateString()}.</span>
              )}
            </p>
            <div className="mt-3 flex space-x-3">
              <button className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                Learn More
              </button>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                View Pricing Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (daysRemaining <= 7) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="text-yellow-900 font-semibold">Grace Period Ending Soon</h3>
            <p className="text-yellow-800 text-sm mt-1">
              You have <strong>{daysRemaining} days</strong> left in your grace period. 
              Platform fees ({platformFeePercentage}%) will begin after 
              {gracePeriodEnd && <span> {gracePeriodEnd.toLocaleDateString()}</span>}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <Gift className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-green-900 font-semibold">Grace Period Active 🎉</h3>
          <p className="text-green-800 text-sm mt-1">
            You're currently enjoying <strong>zero platform fees</strong> for the next{' '}
            <strong>{daysRemaining} days</strong>! This means you keep 100% of your product sales.
            {gracePeriodEnd && (
              <span> Platform fees ({platformFeePercentage}%) will apply starting {gracePeriodEnd.toLocaleDateString()}.</span>
            )}
          </p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Grace Period Progress</span>
              <span className="text-green-700 font-medium">{daysRemaining} days remaining</span>
            </div>
            <div className="mt-2 bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, (daysRemaining / 60) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GracePeriodBanner;

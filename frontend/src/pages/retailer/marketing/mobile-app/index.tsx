import React from 'react';
import { Smartphone } from 'lucide-react';
import PremiumFeatureComingSoon from '@/components/ComingSoon/PremiumFeatureComingSoon';
import RetailerLayout from '../../layout';

const MobileAppComingSoon = () => {
  const features = [
    'Custom branded mobile app for iOS and Android',
    'Push notifications for promotions and updates',
    'Native mobile shopping experience',
    'Offline browsing capabilities',
    'Mobile-optimized checkout process',
    'App Store and Google Play Store listing',
    'Customer loyalty program integration',
    'In-app customer support chat',
    'Social sharing and referral features',
    'App analytics and user behavior tracking',
    'Custom app icon and splash screen',
    'Mobile payment integration (Apple Pay, Google Pay)'
  ];

  return (
    <RetailerLayout>
      <PremiumFeatureComingSoon
        title="Mobile App"
        description="Give your customers a premium mobile shopping experience with a custom branded app. Increase engagement, drive sales, and build customer loyalty with push notifications and mobile-first features."
        icon={<Smartphone className='w-8 h-8 text-white' />}
        features={features}
        comingSoonDate="~Q3 2026"
        phase="Phase 3"
        gradient="from-purple-600 to-indigo-700"
        iconBg="from-purple-500 to-indigo-600"
      />
    </RetailerLayout>
  );
};

MobileAppComingSoon.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};


MobileAppComingSoon.noLayout = true;
export default MobileAppComingSoon;

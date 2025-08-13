import React from 'react';
import { Globe } from 'lucide-react';
import PremiumFeatureComingSoon from '@/components/ComingSoon/PremiumFeatureComingSoon';
import RetailerLayout from '../../layout';

const MultiChannelComingSoon = () => {
  const features = [
    'Sync inventory across Amazon, eBay, Etsy, and Facebook',
    'Unified order management from all channels',
    'Automatic price synchronization',
    'Cross-platform analytics and reporting',
    'Bulk product listing and updates',
    'Channel-specific optimization tools',
    'Automated shipping and tracking updates',
    'Multi-marketplace tax management',
    'Centralized customer communication',
    'Performance tracking by channel',
    'Smart repricing based on competition',
    'Automated inventory allocation'
  ];

  return (
    <RetailerLayout>
      <PremiumFeatureComingSoon
        title="Multi-Channel Selling"
        description="Expand your reach by selling across multiple marketplaces from one central dashboard. Manage Amazon, eBay, Etsy, Facebook Marketplace, and more with unified inventory and order management."
        icon={<Globe className='w-8 h-8 text-white' />}
        features={features}
        comingSoonDate="2027"
        phase="Phase 4"
        gradient="from-teal-600 to-cyan-700"
        iconBg="from-teal-500 to-cyan-600"
      />
    </RetailerLayout>
  );
};

MultiChannelComingSoon.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};

MultiChannelComingSoon.noLayout = true;
export default MultiChannelComingSoon;

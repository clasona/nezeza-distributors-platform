import React from 'react';
import { Mail } from 'lucide-react';
import PremiumFeatureComingSoon from '@/components/ComingSoon/PremiumFeatureComingSoon';
import RetailerLayout from '../../layout';
import Email from 'next-auth/providers/email';

const EmailMarketingComingSoon = () => {
  const features = [
    'Drag & drop email builder with professional templates',
    'Automated email campaigns based on customer behavior',
    'Newsletter creation and scheduling tools',
    'Email list management and segmentation',
    'A/B testing for subject lines and content',
    'Advanced analytics and open/click tracking',
    'Integration with customer database',
    'Automated abandoned cart recovery emails',
    'Welcome series and drip campaigns',
    'Personalized product recommendations'
  ];

  return (
    <RetailerLayout>
      <PremiumFeatureComingSoon
        title="Email Marketing"
        description="Build stronger customer relationships with powerful email marketing tools. Create beautiful newsletters, set up automated campaigns, and track performance with detailed analytics."
        icon={<Mail className='w-8 h-8 text-white' />}
        features={features}
        comingSoonDate="~Q2 2026"
        phase="Phase 2"
        gradient="from-green-600 to-emerald-700"
        iconBg="from-green-500 to-emerald-600"
      />
    </RetailerLayout>
  );
};

// This tells Next.js that this page should use the RetailerLayout
EmailMarketingComingSoon.getLayout = function getLayout(page: React.ReactElement) {
  return page; // Layout is already applied in the component
};

EmailMarketingComingSoon.noLayout = true;
export default EmailMarketingComingSoon;

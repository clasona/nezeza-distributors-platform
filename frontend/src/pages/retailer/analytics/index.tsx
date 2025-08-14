import React from 'react';
import { BarChart3 } from 'lucide-react';
import PremiumFeatureComingSoon from '@/components/ComingSoon/PremiumFeatureComingSoon';
import RetailerLayout from '../layout';

const AnalyticsComingSoon = () => {
  const features = [
    'Advanced sales trend analysis and forecasting',
    'Deep customer behavior insights and segmentation',
    'Product performance and profitability analysis',
    'Marketing campaign ROI tracking',
    'Custom report builder with scheduled exports',
    'Real-time dashboard with customizable widgets',
    'Comparative analytics across time periods',
    'Predictive analytics for inventory management',
    'Customer lifetime value calculations',
    'Automated business intelligence alerts'
  ];

  return (
    <RetailerLayout>
      <PremiumFeatureComingSoon
        title="Advanced Analytics"
        description="Unlock powerful business insights with our premium analytics suite. Get deep visibility into your sales, customers, and growth opportunities with advanced reporting and predictive analytics."
        icon={<BarChart3 className='w-8 h-8 text-white' />}
        features={features}
        comingSoonDate="~Q1 2026"
        phase="Phase 1"
        gradient="from-vesoko_primary600 to-indigo-700"
        iconBg="from-vesoko_primary500 to-indigo-600"
      />
    </RetailerLayout>
  );
};

AnalyticsComingSoon.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};

AnalyticsComingSoon.noLayout = true;
export default AnalyticsComingSoon;

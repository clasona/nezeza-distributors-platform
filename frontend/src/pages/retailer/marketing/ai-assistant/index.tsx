import React from 'react';
import { Zap } from 'lucide-react';
import PremiumFeatureComingSoon from '@/components/ComingSoon/PremiumFeatureComingSoon';
import RetailerLayout from '../../layout';

const AIAssistantComingSoon = () => {
  const features = [
    'AI-powered product recommendations for customers',
    'Intelligent inventory forecasting and reorder suggestions',
    'Dynamic pricing optimization based on market data',
    'Automated customer service chatbot',
    'Smart content generation for product descriptions',
    'Predictive analytics for sales trends',
    'AI-driven marketing campaign optimization',
    'Intelligent customer segmentation',
    'Automated social media post generation',
    'Voice-activated store management',
    'AI-powered image recognition for inventory',
    'Smart business insights and reporting'
  ];

  return (
    <RetailerLayout>
      <PremiumFeatureComingSoon
        title="AI Assistant"
        description="Supercharge your business with artificial intelligence. Get smart recommendations, automate routine tasks, and make data-driven decisions with our AI-powered business assistant."
        icon={<Zap className='w-8 h-8 text-white' />}
        features={features}
        comingSoonDate="~Q2 2026"
        phase="Phase 2"
        gradient="from-orange-600 to-red-700"
        iconBg="from-orange-500 to-red-600"
      />
    </RetailerLayout>
  );
};

AIAssistantComingSoon.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};

AIAssistantComingSoon.noLayout = true;
export default AIAssistantComingSoon;

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerSupportHome from '@/components/Support/SupportCenter/CustomerSupportHome';
import CustomerSupportSubmitTicket from '@/components/Support/SupportCenter/CustomerSupportSubmitTicket';
import CustomerSupportFAQS from '@/components/Support/SupportCenter/CustomerSupportFAQS';
import SupportCenterLayout from '@/components/Support/SupportCenter/SupportCenter';
import CustomerSupportOrderAssistance from '@/components/Support/SupportCenter/CustomerSupportOrderAssistance';
import CustomerSupportTrackPackage from '@/components/Support/SupportCenter/CustomerSupportTrackPackage';
import CustomerSupportMyTickets from '@/components/Support/SupportCenter/CustomerSupportMyTickets';

const TAB_MAP = {
  '': 'home',
  'submit-ticket': 'submit-ticket',
  'faqs': 'faqs',
  'my-tickets': 'my-tickets',
  'track-package':'track-package',
  'order-assistance':'order-assistance',
};

type TabValue = 'home' | 'submit-ticket' | 'faqs' | 'my-tickets' | 'track-package' | 'order-assistance';

const CustomerSupportPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabValue>('home');

  useEffect(() => {
    const lastSegment = pathname?.split('/').pop() || '';
    const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
    setSelectedTab(mappedTab as TabValue);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    const targetPath = `/customer/support${value === 'home' ? '' : `/${value}`}`;
    router.push(targetPath);
  };

  const tabs = [
    { 
      label: 'Home', 
      value: 'home', 
      content: <CustomerSupportHome />,
      icon: '🏠'
    },
    { 
      label: 'Submit Ticket', 
      value: 'submit-ticket', 
      content: <CustomerSupportSubmitTicket />,
      icon: '🎫'
    },
    { 
      label: 'My Tickets', 
      value: 'my-tickets', 
      content: <CustomerSupportMyTickets />,
      icon: '📋'
    },
    { 
      label: 'Track Package', 
      value: 'track-package', 
      content: <CustomerSupportTrackPackage />,
      icon: '📦'
    },
    { 
      label: 'Order Help', 
      value: 'order-assistance', 
      content: <CustomerSupportOrderAssistance />,
      icon: '🛒'
    },
    { 
      label: 'FAQs', 
      value: 'faqs', 
      content: <CustomerSupportFAQS />,
      icon: '❓'
    },
  ];

  const tabContent = tabs.find((tab) => tab.value === selectedTab)?.content;

  return (
    <SupportCenterLayout
      tabBar={
        <Tabs value={selectedTab} onValueChange={handleTabChange}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <div className="max-w-6xl mx-auto mt-10 mb-4 px-4">
        {tabContent}
      </div>
    </SupportCenterLayout>
  );
};

export default CustomerSupportPage; 
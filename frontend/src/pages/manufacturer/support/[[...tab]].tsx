'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupportCenterLayout from '@/components/Support/SupportCenter/SupportCenter';
import CustomerSupportHome from '@/components/Support/SupportCenter/CustomerSupportHome';
import CustomerSupportSubmitTicket from '@/components/Support/SupportCenter/CustomerSupportSubmitTicket';
import CustomerSupportFAQS from '@/components/Support/SupportCenter/CustomerSupportFAQS';
import CustomerSupportMyTickets from '@/components/Support/SupportCenter/CustomerSupportMyTickets';

const TAB_MAP = {
  '': 'home',
  'submit-ticket': 'submit-ticket',
  'faqs': 'faqs',
  'my-tickets': 'my-tickets',
};

type TabValue = 'home' | 'submit-ticket' | 'faqs' | 'my-tickets';

const ManufacturerSupportPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabValue>('home');

  useEffect(() => {
    const lastSegment = pathname?.split('/').pop() || '';
    const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
    setSelectedTab(mappedTab as TabValue);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    const targetPath = `/manufacturer/support${value === 'home' ? '' : `/${value}`}`;
    router.push(targetPath);
  };

  const tabs = [
    { label: 'Home', value: 'home', content: <CustomerSupportHome /> },
    { label: 'Submit Ticket', value: 'submit-ticket', content: <CustomerSupportSubmitTicket /> },
    { label: 'My Tickets', value: 'my-tickets', content: <CustomerSupportMyTickets /> },
    { label: 'FAQs', value: 'faqs', content: <CustomerSupportFAQS /> },
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

export default ManufacturerSupportPage; 
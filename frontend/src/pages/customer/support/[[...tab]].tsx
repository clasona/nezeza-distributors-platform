<<<<<<< HEAD
// 'use client';
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import ShadcnTabs from '@/components/Shadcn/ShadcnTabs';
// import CustomerSupportHome from '@/components/Support/SupportCenter/CustomerSupportHome';
// import CustomerSupportSubmitTicket from '@/components/Support/SupportCenter/CustomerSupportSubmitTicket';
// import CustomerSupportFAQS from '@/components/Support/SupportCenter/CustomerSupportFAQS';
// import SupportCenterLayout from '@/components/Support/SupportCenter/SupportCenter';

// const TAB_MAP = {
//   '': 'home',
//   'submit-ticket': 'submit-ticket',
//   'faqs': 'faqs',
// };

// type TabValue = 'home' | 'submit-ticket' | 'faqs';

// const CustomerSupportTabs = () => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const lastSegment = typeof pathname === 'string' ? pathname.split('/').pop() || '' : '';
//   const [selectedTab, setSelectedTab] = useState<TabValue>('home');

//   useEffect(() => {
//     const rawTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
//     setSelectedTab(
//       ['home', 'submit-ticket', 'faqs'].includes(rawTab) ? (rawTab as TabValue) : 'home'
//     );
//   }, [lastSegment]);

//   const handleTabChange = (value: string) => {
//     if (['home', 'submit-ticket', 'faqs'].includes(value)) {
//       setSelectedTab(value as TabValue);
//       router.push(`/customer/support${value === 'home' ? '' : `/${value}`}`);
//     } else {
//       console.warn('Invalid tab:', value);
//     }
//   };

//   return (
//     <ShadcnTabs
//       value={selectedTab}
//       onTabChange={handleTabChange}
//       tabs={[
//         {
//           label: 'Home',
//           value: 'home',
//           content: <CustomerSupportHome />,
//         },
//         {
//           label: 'Submit Ticket',
//           value: 'submit-ticket',
//           content: <CustomerSupportSubmitTicket />,
//         },
//         {
//           label: 'FAQS',
//           value: 'faqs',
//           content: <CustomerSupportFAQS />,
//         },
//       ]}
//     />
//   );
// };

// const CustomerSupportPage = () => {
//   return (
//     <SupportCenterLayout>
//       <div className='max-w-6xl mx-auto mt-10 mb-4 px-4'>
//         <h1 className='text-2xl font-semibold mb-6'>Vesoko Customer Support</h1>
//         <CustomerSupportTabs />
//       </div>
//     </SupportCenterLayout>
//   );
// };

// export default CustomerSupportPage;


// 'use client';
// import { useRouter, usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import ShadcnTabs from '@/components/Shadcn/ShadcnTabs';
// import CustomerSupportHome from '@/components/Support/SupportCenter/CustomerSupportHome';
// import CustomerSupportSubmitTicket from '@/components/Support/SupportCenter/CustomerSupportSubmitTicket';
// import CustomerSupportFAQS from '@/components/Support/SupportCenter/CustomerSupportFAQS';
// import SupportCenterLayout from '@/components/Support/SupportCenter/SupportCenter';

// const TAB_MAP = {
//   '': 'home',
//   'submit-ticket': 'submit-ticket',
//   'faqs': 'faqs',
// };
// type TabValue = 'home' | 'submit-ticket' | 'faqs';

// const CustomerSupportTabs = () => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [selectedTab, setSelectedTab] = useState<TabValue>('home');

//   useEffect(() => {
//     const lastSegment = pathname?.split('/').pop() || '';
//     const mappedTab = TAB_MAP[lastSegment as keyof typeof TAB_MAP] || 'home';
//     console.log('lastSegment:', lastSegment, '-> mappedTab:', mappedTab);
//     setSelectedTab(mappedTab as TabValue);
//   }, [pathname]);

//   const handleTabChange = (value: string) => {
//     const targetPath = `/customer/support${value === 'home' ? '' : `/${value}`}`;
//     if (value !== selectedTab) {
//       setSelectedTab(value as TabValue);
//       router.push(targetPath);
//     }
//   };

//   return (
//     <ShadcnTabs
//     key={selectedTab}
//       value={selectedTab}
//       onTabChange={handleTabChange}
//       tabs={[
//         { label: 'Home', value: 'home', content: <CustomerSupportHome /> },
//         { label: 'Submit Ticket', value: 'submit-ticket', content: <CustomerSupportSubmitTicket /> },
//         { label: 'FAQS', value: 'faqs', content: <CustomerSupportFAQS /> },
//       ]}
//     />
//   );
// };

// const CustomerSupportPage = () => {
//   return (
//     <SupportCenterLayout>
//       <div className='max-w-6xl mx-auto mt-10 mb-4 px-4'>
//         <h1 className='text-2xl font-semibold mb-6'>Vesoko Customer Support</h1>
//         <CustomerSupportTabs />
//       </div>
//     </SupportCenterLayout>
//   );
// };

// export default CustomerSupportPage;

=======
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2
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
<<<<<<< HEAD
=======
import CustomerSupportMyTickets from '@/components/Support/SupportCenter/CustomerSupportMyTickets';
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2

const TAB_MAP = {
  '': 'home',
  'submit-ticket': 'submit-ticket',
  'faqs': 'faqs',
<<<<<<< HEAD

=======
  'my-tickets': 'my-tickets',
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2
  'track-package':'track-package',
  'order-assistance':'order-assistance',
};

<<<<<<< HEAD
type TabValue = 'home' | 'submit-ticket' | 'faqs' | 'track package' | 'order assistance';
=======
type TabValue = 'home' | 'submit-ticket' | 'faqs' | 'my-tickets' | 'track-package' | 'order-assistance';
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2

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
<<<<<<< HEAD
    { label: 'Home', value: 'home', content: <CustomerSupportHome /> },
    { label: 'Submit Ticket', value: 'submit-ticket', content: <CustomerSupportSubmitTicket /> },
    { label: 'FAQs', value: 'faqs', content: <CustomerSupportFAQS /> },
    { label: 'Order Assistance', value: 'order-assistance', content: <CustomerSupportOrderAssistance /> },
    { label: 'Track Package', value: 'track-package', content: <CustomerSupportTrackPackage /> },
=======
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
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2
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
<<<<<<< HEAD
      <div className="max-w-6xl mx-auto mt-10 mb-4 px-4">
        <h1 className="text-2xl font-semibold mb-6">Vesoko Customer Support</h1>
=======
      <div className="max-w-7xl mx-auto mt-2 mb-4 px-4">
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2
        {tabContent}
      </div>
    </SupportCenterLayout>
  );
};

<<<<<<< HEAD
export default CustomerSupportPage;



=======
export default CustomerSupportPage; 
>>>>>>> e231e2f58b2b02c985f68bd4d57e4ef2bf6cabc2

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

type TabItem = {
  label: string;
  value: string;
  content: React.ReactNode;
};

type ShadcnTabsProps = {
    tabs: TabItem[];
    value: string;
    onTabChange: (val: string) => void;
  };
  
  const ShadcnTabs = ({ tabs, value, onTabChange }: ShadcnTabsProps) => {
    return (
      <Tabs value={value} onValueChange={onTabChange} className='w-full'>
        <TabsList className='mb-6'>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='relative pb-2 cursor-pointer border-b-2 border-transparent data-[state=active]:border-nezeza_dark_blue data-[state=active]:text-nezeza_dark_blue'
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
  
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  };
  
  export default ShadcnTabs;
  
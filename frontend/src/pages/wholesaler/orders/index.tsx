import Heading from '@/components/Heading';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import WholesalerLayout from '../layout';
import PageHeader from '@/components/PageHeader';
import PageHeaderLink from '@/components/PageHeaderLink';

export default function index() {
  return (
    <WholesalerLayout>
      <div>
        <PageHeader
          heading='Orders Home'
          extraComponent={
            <PageHeaderLink
              linkTitle={'Create Order'}
              href={'./orders/new-order'}
            />
          }
        />
        <h2>Orders Home</h2>
      </div>
    </WholesalerLayout>
  );
}

index.noLayout = true;

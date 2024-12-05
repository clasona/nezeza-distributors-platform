import Heading from '@/components/Heading';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import WholesalerLayout from '../index';
import PageHeader from '@/components/PageHeader';

export default function index() {
    return (
      <WholesalerLayout>
        <div>
          <PageHeader
            heading='Customer Orders'
            href='./orders/new-order'
            linkTitle='Create Order'
          />

          <h2>Customer Orders</h2>
        </div>
      </WholesalerLayout>
    );
}

index.noLayout = true;

import Heading from '@/components/Heading';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import WholesalerLayout from '../index';
import PageHeader from '@/components/PageHeader';

export default function CustomerOrders() {
  return (
    <WholesalerLayout>
      <div>
        {/* <PageHeader
          heading='My Orders'
          href='./orders/new-order'
          linkTitle='Create Order'
        /> */}

        <div className='flex justify-between'>
          <Heading title='My Orders'></Heading>

          <Link
            className='text-white bg-green-600 space-x-3 hover:bg-green-600/90 focus:ring-4 focus:outline-none focus:ring-green-600/50 font-medium rounded-lg text-base px-5 py-3 text-center inline-flex items-center dark:focus:ring-green-600/55 me-2 mb-2'
            href='./orders/new-order'
          >
            <Plus />
            <span>Add Order</span>
          </Link>
        </div>
        <h2>Customer Orders</h2>
      </div>
    </WholesalerLayout>
  );
}

CustomerOrders.noLayout = true;

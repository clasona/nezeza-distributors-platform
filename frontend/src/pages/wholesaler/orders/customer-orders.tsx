import Heading from '@/components/Heading';
import { Download, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import WholesalerLayout from '../index';
import PageHeader from '@/components/PageHeader';
import TableActions from '@/components/Table/TableActions';

const CustomerOrders = () => {
  return (
    <WholesalerLayout>
      <div>
        {/* Header */}
        <PageHeader
          heading='Customer Orders'
          href='./orders/new-order'
          linkTitle='Create Order'
        />
        {/* Table Actions */}
        {/* Export \\ Search \\ Delete bulk */}
        <TableActions />

        <h2 className='py-8'> The Table</h2>
      </div>
    </WholesalerLayout>
  );
};

CustomerOrders.noLayout = true;
export default CustomerOrders;

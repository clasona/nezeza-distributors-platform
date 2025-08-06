import PageHeader from './PageHeader';
import MetricCard from '@/components/Charts/MetricCard';
import { Users, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import Pagination from '@/components/Table/Pagination';
import Loading from '@/components/Loaders/Loading';
import { UserProps } from '../../type';
import { fetchCustomers } from '@/utils/customer/fetchCustomers';
import { handleError } from '@/utils/errorUtils';

const SellerCustomers = () => {
  const [customers, setCustomers] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Set the number of customers per page

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const customersData = await fetchCustomers();
        setCustomers(customersData);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const totalCustomers = customers.length;
  const newCustomers = 25; // Placeholder value; integrate with real logic if needed
  const activeCustomers = customers.filter(c => c.isVerified).length;
  const inactiveCustomers = totalCustomers - activeCustomers;

  return (
    <div className='p-4'>
      <PageHeader heading='Customers Overview' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <MetricCard
          title='Total Customers'
          value={totalCustomers}
          icon={<Users className='w-6 h-6' />}
          color='purple'
        />
        <MetricCard
          title='New Customers'
          value={newCustomers}
          icon={<TrendingUp className='w-6 h-6' />}
          color='green'
        />
        <MetricCard
          title='Verified Customers'
          value={activeCustomers}
          icon={<UserCheck className='w-6 h-6' />}
          color='blue'
        />
        <MetricCard
          title='Unverified Customers'
          value={inactiveCustomers}
          icon={<UserX className='w-6 h-6' />}
          color='red'
        />
      </div>
      {/* Customer Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='w-full text-sm text-left text-vesoko_gray_600'>
          <TableHead
            columns={[
              { title: 'Customer ID', id: '_id' },
              { title: 'Name', id: 'name' },
              { title: 'Email', id: 'email' },
              { title: 'Verified', id: 'isVerified' },
              { title: 'Join Date', id: 'createdAt' }
            ]}
            handleSort={() => {}}
            checked={false}
            onChange={() => {}}
          />
          {isLoading ? (
            <Loading message='Loading customers...' />
          ) : (
            <tbody>
              {customers
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((customer: UserProps) => (
                  <TableRow
                    key={customer._id}
                    rowValues={[
                      { content: customer._id },
                      { content: `${customer.firstName} ${customer.lastName}` },
                      { content: customer.email },
                      { content: customer.isVerified ? 'Verified' : 'Unverified', isStatus: true },
                      { content: new Date(customer.verifiedAt || '').toLocaleDateString() || 'N/A' }
                    ]}
                    rowData={customer}
                    onDelete={() => {}}
                  />
                ))}
            </tbody>
          )}
        </table>
        <Pagination
          data={customers}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default SellerCustomers;

import PageHeader from './PageHeader';
import MetricCard from '@/components/Charts/MetricCard';
import { Users, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import Pagination from '@/components/Table/Pagination';
import Loading from '@/components/Loaders/Loading';
import { stateProps, UserProps } from '../../type';
import { fetchCustomers } from '@/utils/customer/fetchCustomers';
import { handleError } from '@/utils/errorUtils';
import { useSelector } from 'react-redux';

const SellerCustomers = () => {
    const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);
  const [customers, setCustomers] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Set the number of customers per page

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        // Pass the actual store ID value to fetchCustomers
        const customersData = await fetchCustomers(storeInfo._id);
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
  // Calculate new customers based on join date (e.g., joined in last 30 days)
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const newCustomers = customers.filter(c => {
    if (!c.createdAt) return false;
    const created = new Date(c.createdAt).getTime();
    return now - created <= THIRTY_DAYS;
  }).length;
  const activeCustomers = customers.filter(c => c.isVerified).length;
  const inactiveCustomers = totalCustomers - activeCustomers;

  // Since there is no selectedRows state or logic, let's add basic selection logic.
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  function handleSelectAllRows(): void {
    if (selectedRows.length === customers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(customers.map(customer => customer._id));
    }
  }
   // Basic sorting implementation for customer table
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  function handleSort(column: string): void {
    setSortConfig(prev => {
      if (prev && prev.key === column) {
        // Toggle direction
        return { key: column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: column, direction: 'asc' };
    });
  }

   // Modal state for viewing customer details
   const [selectedCustomer, setSelectedCustomer] = useState<UserProps | null>(null);
   const [customerOrders, setCustomerOrders] = useState<any[]>([]);
   const [showCustomerModal, setShowCustomerModal] = useState(false);

   // Fetch products ordered by customer
   async function handleViewCustomer(customer: UserProps) {
       setSelectedCustomer(customer);
       setShowCustomerModal(true);
       try {
           // Fetch seller's suborders for this customer
           const res = await fetch('/api/v1/suborders?sellerStoreId=' + storeInfo._id + '&buyerId=' + customer._id);
           const data = await res.json();
           setCustomerOrders(data.subOrders || []);
       } catch (err) {
           setCustomerOrders([]);
       }
   }

   function handleCloseCustomerModal() {
       setShowCustomerModal(false);
       setSelectedCustomer(null);
       setCustomerOrders([]);
   }
  // Apply sorting to customers before pagination
  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    let aValue = a[key as keyof UserProps];
    let bValue = b[key as keyof UserProps];

    // Handle string and boolean comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return direction === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    // Fallback for other types
    return 0;
  });
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
            checked={selectedRows.length === customers.length}
            onChange={handleSelectAllRows}
            handleSort={handleSort}
            columns={[
              { title: 'Customer ID', id: '_id' },
              { title: 'Name', id: 'name' },
              { title: 'Email', id: 'email' },
              { title: 'Verified', id: 'isVerified' },
              { title: 'Join Date', id: 'createdAt' }
            ]}
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
                      {
                        content: (
                          <input
                            type='checkbox'
                            checked={selectedRows.includes(customer._id)}
                            onChange={() => {
                              setSelectedRows((prev) =>
                                prev.includes(customer._id)
                                  ? prev.filter((id) => id !== customer._id)
                                  : [...prev, customer._id]
                              );
                            }}
                          />
                        ),
                      },
                      { content: customer._id },
                      { content: `${customer.firstName} ${customer.lastName}` },
                      { content: customer.email },
                      { content: customer.isVerified ? 'Verified' : 'Unverified', isStatus: true },
                      { content: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A' },
                      {
                        content: (
                          <button
                            className='px-2 py-1 bg-vesoko_green_500 text-white rounded hover:bg-vesoko_green_700 text-xs mr-2'
                            onClick={() => handleViewCustomer(customer)}
                          >
                            View
                          </button>
                        ),
                      },
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
      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative'>
            <button
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
              onClick={handleCloseCustomerModal}
            >
              &times;
            </button>
            <h2 className='text-lg font-bold mb-2'>Customer Details</h2>
            <div className='mb-2'>
              <strong>Name:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}<br />
              <strong>Email:</strong> {selectedCustomer.email}<br />
              <strong>Verified:</strong> {selectedCustomer.isVerified ? 'Yes' : 'No'}<br />
              <strong>Joined:</strong> {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <h3 className='font-semibold mt-4 mb-2'>Products Ordered</h3>
            {selectedCustomer && selectedCustomer.productsOrdered && selectedCustomer.productsOrdered.length > 0 ? (
              <ul className='list-disc pl-5 text-sm'>
                {selectedCustomer.productsOrdered.map((prod: any, idx: number) => (
                  <li key={idx}>
                    {prod.title} (Qty: {prod.quantity})
                  </li>
                ))}
              </ul>
            ) : (
              <div className='text-sm text-gray-500'>No products found for this customer.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCustomers;

const WholesalerCustomerOrders = () => {
  const [existingOrders, setExistingOrders] = useState<OrderProps[]>([]);
  const [sampleOrders, setSampleOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [statusFilter, setStatusFilter] = useState('Status');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sampleOrdersData = mockOrders;
        setSampleOrders(sampleOrdersData);
        setFilteredOrders(sampleOrdersData); // Initially show all orders
      } catch (error) {
        console.error('Error fetching existing orders data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter orders based on search query and status
  useEffect(() => {
    const filtered = sampleOrders.filter((order) => {
      const searchMatch = Object.values(order)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const statusMatch =
        statusFilter === 'Status' || order.fulfillmentStatus === statusFilter;
      return searchMatch && statusMatch;
    });

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, sampleOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  return (
    <WholesalerLayout>
      <div className=''>
        <PageHeader
          heading='Customer Orders'
          href='./orders/new'
          linkTitle='Create New Order'
        />

        <SmallCards orderStats={calculateOrderStats(existingOrders)} />

        <TableFilters>
          <SearchField
            searchFieldPlaceholder='orders'
            onSearchChange={handleSearchChange} // Pass the handler to SearchField
          />
          <StatusFilters
            label='Filter by Status'
            options={[
              'Status',
              'Pending',
              'Fulfilled',
              'Shipped',
              'Delivered',
              'Completed',
              'Canceled',
            ]}
            selectedOption={statusFilter}
            onChange={(status) => setStatusFilter(status)} // Update status filter
          />
        </TableFilters>

        {/* Orders Table */}
        <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
          <table
            id='customer-orders-table'
            className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'
          >
            <TableHead columns={tableColumns} handleSort={handleSort} />
            <tbody>
              {filteredOrders
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((order) => (
                  <TableRow
                    key={order._id}
                    rowValues={[
                      { content: <input type='checkbox' /> },
                      { content: order.fulfillmentStatus },
                      { content: order._id },
                      { content: '' },
                      {
                        content: (
                          <Link href='#' className='text-nezeza_dark_blue'>
                            {order.orderItems.length}
                          </Link>
                        ),
                      },
                      {
                        content: `$${order.orderItems
                          .reduce((total, item) => total + item.price, 0)
                          .toFixed(2)}`,
                      },
                      { content: order.orderDate },
                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              { href: '#', label: 'Remove' },
                              { href: '#', label: 'Update' },
                            ]}
                          />
                        ),
                      },
                    ]}
                  />
                ))}
            </tbody>
          </table>
          <Pagination
            data={filteredOrders}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </WholesalerLayout>
  );
};

import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/Charts/MetricCard';
import MoreOrderDetailsModal from '@/components/Order/MoreOrderDetailsModal';
import DeleteRowModal from '@/components/Table/DeleteRowModal';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import Pagination from '@/components/Table/Pagination';
import RowActionDropdown, { ActionItem } from '@/components/Table/RowActionDropdown';
import SearchField from '@/components/Table/SearchField';
import TableFilters from '@/components/Table/TableFilters';
import ModernTable, { TableRow as ModernTableRow } from '@/components/Table/ModernTable';
import { TableColumn } from '@/components/Table/TableHeader';
import { TableCellData } from '@/components/Table/TableBodyRow';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import { getOrderStatus } from '@/lib/utils';
import { handleError } from '@/utils/errorUtils';
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';
import { archiveOrder } from '@/utils/order/archiveOrder';
import { getMyUnarchivedOrders } from '@/utils/order/getMyUnarchivedOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import { checkIfProductExists } from '@/utils/product/checkIfProductExists';
import { sortItems } from '@/utils/sortItems';
import { 
  Plus, 
  RotateCcw, 
  RotateCw, 
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  Eye,
  Edit,
  Trash2,
  Archive,
  Download,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { OrderItemsProps, OrderProps } from '../../type';
import ErrorMessageModal from './ErrorMessageModal';
import Button from './FormInputs/Button';
import Loading from './Loaders/Loading';
import ConfirmNewProductModal from './Product/ConfirmNewProductModal';
import ConfirmUpdateProductModal from './Product/ConfirmUpdateProductModal';
import SuccessMessageModal from './SuccessMessageModal';
import ArchiveRowModal from './Table/ArchiveRowModal';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';

const SellerMyOrders = () => {
  // Feature flag for My Orders - set to true when ready to launch
  const MY_ORDERS_ENABLED = false; // TODO: Set to true when Phase 2 is ready

  const [myOrders, setMyOrders] = useState<OrderProps[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

  // For handling adding ordered products to inventory
  const [selectedItemToUpdate, setSelectedItemToUpdate] =
    useState<OrderItemsProps | null>(null);
  const [selectedItemToCreate, setSelectedItemToCreate] =
    useState<OrderItemsProps | null>(null);
  // For sorting and filtering
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    label: string;
  } | null>({ value: 'All', label: 'All' });

  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modern metrics calculation
  const orderStats = calculateOrderStats(filteredOrders);
  
  // Calculate additional metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
  const recentOrders = filteredOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return orderDate >= sevenDaysAgo;
  }).length;

  //for defining what table headers needed
  const tableColumns: TableColumn[] = [
    { id: 'expand', title: '', width: '40px', align: 'center' },
    { id: 'fulfillmentStatus', title: 'Status', sortable: true, width: '120px' },
    { id: '_id', title: 'Order ID', sortable: true, width: '140px' },
    { id: 'orderItems', title: 'Items', sortable: true, width: '80px', align: 'center' },
    { id: 'totalAmount', title: 'Total Amount', sortable: true, width: '120px', align: 'right' },
    { id: 'createdAt', title: 'Created', sortable: true, width: '120px' },
    { id: 'updatedAt', title: 'Updated', sortable: true, width: '120px' },
    { id: 'action', title: 'Action', width: '80px', align: 'center' },
  ];

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Dynamic page size with default of 5

  //for bulk deleting
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  //for table row dropdown actions i.e: update, Delete
  const [isMoreOrderDetailsModalOpen, setIsMoreOrderDetailsModalOpen] =
    useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmUpdateProductModalOpen, setIsConfirmUpdateProductModalOpen] =
    useState(false);
  const [isConfirmNewProductModalOpen, setIsConfirmNewProductModalOpen] =
    useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<OrderProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  //setting my orders data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const myOrdersData = await getMyUnarchivedOrders();
      setMyOrders(myOrdersData);
      setFilteredOrders(myOrdersData); // Initially show all orders
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders based on search query and selected status
  useEffect(() => {
    const flteredBySearching = myOrders.filter((order) => {
      const searchMatch = Object.values(order)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const statusMatch =
        statusFilter === null ||
        (statusFilter.value === 'All' && statusFilter.label === 'All') ||
        order.fulfillmentStatus === statusFilter.value;
      return searchMatch && statusMatch;
    });

    setFilteredOrders(flteredBySearching);
  }, [searchQuery, statusFilter, myOrders]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleStatusFilterChange = (
    status: {
      value: string;
      label: string;
    } | null
  ) => {
    setStatusFilter(status);

    if (status && status.value !== 'Status') {
      const filteredByStatusFiltering = myOrders.filter(
        (order) => order.fulfillmentStatus === status.value
      );
      setFilteredOrders(filteredByStatusFiltering);
    } else {
      setFilteredOrders(myOrders); // Reset to all orders if no filter
    }
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    applyDateFilter(value, endDate);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    applyDateFilter(startDate, value);
  };

  const applyDateFilter = (start: string, end: string) => {
    const filtered = myOrders.filter((order) => {
      const createdDate = order.createdAt; // YYYY-MM-DD format
      const isAfterStart = start ? createdDate >= start : true;
      const isBeforeEnd = end ? createdDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setStatusFilter({ value: 'All', label: 'All' });
    setStartDate('');
    setEndDate('');
    setFilteredOrders(myOrders); // Reset to all orders
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (column: string) => {
    // Pre compute the next sort order and column to ensure that sortItems uses the updated values of sortColumn and sortOrder.
    // React state updates are asynchronous, which means that the updated sortColumn() and sortOrder()
    // may not immediately reflect in the subsequent sortItems call.
    const newSortOrder =
      sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    const newSortColumn = column;

    // Update state
    setSortColumn(newSortColumn);
    setSortOrder(newSortOrder);

    // Use the new values to sort immediately
    const sortedOrders = sortItems(filteredOrders, newSortColumn, newSortOrder);
    setFilteredOrders(sortedOrders);
  };

  const handleMoreOrderDetails = (rowData: OrderProps) => {
    setCurrentRowData(rowData);
    setIsMoreOrderDetailsModalOpen(true);
  };
  const handleCloseMoreOrderDetailsModal = () => {
    setIsMoreOrderDetailsModalOpen(false);
  };

  const handleUpdate = (rowData: OrderProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
  };
  const handleSaveUpdatedRow = (updatedRow: OrderProps) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedRow._id ? { ...order, ...updatedRow } : order
      )
    );
    // TODO: Update in db
    setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
    setIsUpdateModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
  };

  const handleDeleteClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsDeleteModalOpen(true); // Open the modal
  };

  const handleConfirmDelete = async (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
    //TODO: Delete from database

    setSuccessMessage(`Order # ${id} deleted successfully.`);
    setIsDeleteModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleArchiveClick = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsArchiveModalOpen(true); // Open the modal
  };
  const handleConfirmArchive = (id: string) => {
    getOrderStatus(id).then((status) => {
      if (status) {
        if (status === 'Delivered') {
          setErrorMessage('');
          setFilteredOrders((prevOrders) =>
            prevOrders.filter((order) => order._id !== id)
          );
          const orderData: Partial<OrderProps> = {
            fulfillmentStatus: 'Archived',
          };
          if (id) {
            archiveOrder(id, orderData).then(() => {
              setSuccessMessage(`Order # ${id} archived successfully.`);
              setIsArchiveModalOpen(false);
              setTimeout(() => setSuccessMessage(''), 4000);
            });
          }
        } else {
          setErrorMessage(
            "Order status must be 'Delivered' to perform this action."
          );
          setTimeout(() => setErrorMessage(''), 4000);
        }
      }
    });
  };

  //for bulk deleting
  const handleSelectRow = (id: string) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };
  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredOrders.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredOrders.map((item) => item._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      // await Promise.all(selectedRows.map((id) => deleteMyOrder(id)));

      setFilteredOrders((prevInventory) =>
        prevInventory.filter((item) => !selectedRows.includes(item._id))
      );

      setSelectedRows([]);
      setSuccessMessage('Selected items deleted successfully.');
    } catch (error) {
      console.error('Error deleting selected items:', error);
      alert('Error deleting selected items.');
    } finally {
      setIsBulkDeleteModalOpen(false);
    }
  };

  const confirmProductExists = async (productId: string) => {
    const productExists = await checkIfProductExists(productId);
    if (productExists) {
      setIsConfirmUpdateProductModalOpen(true); // Open the modal
      // setErrorMessage('');
    } else {
      setErrorMessage(
        'Product does not exist in your current inventory. You can add it as a new product.'
      );
      setTimeout(() => setErrorMessage(''), 4000);
      // return;
    }
  };

  // Helper function to get status variant for styling
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'success';
      case 'shipped':
      case 'processing':
        return 'info';
      case 'pending':
      case 'placed':
        return 'warning';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // Helper function to generate enhanced action items
  const generateActionItems = (order: OrderProps): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        variant: 'primary',
        onClick: () => handleMoreOrderDetails(order),
      },
      {
        label: 'Edit Order',
        icon: <Edit className="w-4 h-4" />,
        variant: 'secondary',
        onClick: () => handleUpdate(order),
      },
      {
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => handleDeleteClick(order),
      },
      {
        label: 'Archive',
        icon: <Archive className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => handleArchiveClick(order),
      },
    ];

    return actions;
  };

  // Convert orders to table rows following SellerCustomerOrders pattern
  const tableRows: ModernTableRow[] = filteredOrders
    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((order) => ({
      id: order._id,
      data: order,
      cells: [
        {
          content: order.fulfillmentStatus,
          isStatus: true,
          statusVariant: getStatusVariant(order.fulfillmentStatus),
        },
        {
          content: (
            <span className="font-mono text-sm">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          ),
        },
        {
          content: (
            <Link href="#" className="text-vesoko_dark_blue hover:underline">
              {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
            </Link>
          ),
          align: 'center',
        },
        {
          content: (
            <span className="font-semibold">
              ${formatPrice(order.totalAmount)}
            </span>
          ),
          align: 'right',
        },
        {
          content: formatDate(order.createdAt),
        },
        {
          content: formatDate(order.updatedAt),
        },
        {
          content: (
            <div data-interactive>
              <RowActionDropdown
                actions={generateActionItems(order)}
                dropdownId={`order-${order._id}`}
                variant="minimal"
                size="sm"
              />
            </div>
          ),
          align: 'center',
        },
      ],
      expandedContent: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {order.orderItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 min-w-64"
              >
                <Image
                  src={item.image}
                  alt={item.description || item.product?.title}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {item.product?.title || 'Title Missing'}
                  </p>
                  <p className="text-vesoko_gray_600 text-xs">
                    {item.quantity} × ${item.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Product Update/Create Actions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Inventory Management</h5>
            <p className="text-sm text-gray-600 mb-3">
              Add delivered items to your inventory or update existing products:
            </p>
            <div className="flex gap-2">
              <Button
                buttonTitle='Update Existing'
                icon={RotateCw}
                className='px-3 py-2 outline text-vesoko_dark_blue hover:text-white hover:bg-vesoko_dark_blue text-sm'
                onClick={async () => {
                  const status = await getOrderStatus(order._id);
                  if (status === 'Delivered') {
                    // Handle updating existing products
                    setSuccessMessage('Feature coming soon: Update existing products');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  } else {
                    setErrorMessage("Order status must be 'Delivered' to perform this action.");
                    setTimeout(() => setErrorMessage(''), 4000);
                  }
                }}
              />
              <Button
                buttonTitle='Create New Products'
                icon={Plus}
                className='px-3 py-2 outline text-vesoko_green_600 hover:text-white hover:bg-vesoko_green_600 text-sm'
                onClick={async () => {
                  const status = await getOrderStatus(order._id);
                  if (status === 'Delivered') {
                    // Handle creating new products
                    setSuccessMessage('Feature coming soon: Create new products from order');
                    setTimeout(() => setSuccessMessage(''), 3000);
                  } else {
                    setErrorMessage("Order status must be 'Delivered' to perform this action.");
                    setTimeout(() => setErrorMessage(''), 4000);
                  }
                }}
              />
            </div>
          </div>
        </div>
      ),
    }));

  // Coming Soon Component
  const ComingSoonSection = () => (
    <div className='max-w-4xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-12'>
        <div className='inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4'>
          <Clock className='w-4 h-4 mr-2' />
          Coming Soon - Phase 2
        </div>
        <h1 className='text-4xl sm:text-5xl font-bold text-vesoko_dark_blue mb-4'>
          🚀 My Orders - Direct Sourcing from Africa
        </h1>
        <p className='text-xl text-gray-600 leading-relaxed'>
          We're building something amazing for you!
        </p>
      </div>

      {/* Main Feature Card */}
      <div className='bg-gradient-to-br from-vesoko_dark_blue via-blue-600 to-vesoko_dark_blue_2 rounded-3xl p-8 sm:p-12 text-white shadow-2xl mb-12'>
        <div className='grid lg:grid-cols-2 gap-8 items-center'>
          <div>
            <h2 className='text-3xl font-bold mb-6'>Direct Sourcing from Africa</h2>
            <p className='text-blue-100 text-lg leading-relaxed mb-8'>
              Soon, retailers will be able to source and buy their products/inventory directly from Africa 
              within the same Vesoko platform. We'll handle most of the workload on this end, making 
              international sourcing as easy as local purchasing.
            </p>
            
            <div className='space-y-4'>
              {[
                'Browse authentic African products',
                'Direct connection with African manufacturers',
                'Streamlined logistics and shipping',
                'Automated customs and compliance',
                'Real-time order tracking',
                'Dedicated support team'
              ].map((feature, index) => (
                <div key={index} className='flex items-center gap-3'>
                  <CheckCircle className='w-5 h-5 text-green-300 flex-shrink-0' />
                  <span className='text-blue-50'>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className='lg:text-center'>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20'>
              <Package className='w-16 h-16 text-blue-200 mx-auto mb-4' />
              <h3 className='text-xl font-semibold mb-2'>What to Expect</h3>
              <p className='text-blue-100 text-sm leading-relaxed'>
                A seamless ordering experience that connects you directly with African suppliers, 
                complete with inventory management, order tracking, and automated workflows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className='grid md:grid-cols-3 gap-6 mb-12'>
        {[
          {
            icon: <ShoppingBag className='w-8 h-8' />,
            title: 'Effortless Ordering',
            description: 'Browse and order African products with just a few clicks',
            gradient: 'from-green-400 to-emerald-600'
          },
          {
            icon: <Truck className='w-8 h-8' />,
            title: 'End-to-End Logistics',
            description: 'We handle shipping, customs, and delivery tracking for you',
            gradient: 'from-blue-400 to-blue-600'
          },
          {
            icon: <Clock className='w-8 h-8' />,
            title: 'Time-Saving Automation',
            description: 'Automated inventory management and order processing',
            gradient: 'from-purple-400 to-purple-600'
          }
        ].map((benefit, index) => (
          <div key={index} className='group hover:scale-105 transition-transform duration-300'>
            <div className='bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100'>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.gradient} text-white mb-4`}>
                {benefit.icon}
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>{benefit.title}</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className='bg-gray-50 rounded-2xl p-8 text-center'>
        <h3 className='text-2xl font-bold text-gray-900 mb-4'>Development Timeline</h3>
        <p className='text-gray-600 mb-6'>
          We're working hard to bring this feature to you as part of our Phase 2 expansion.
        </p>
        <div className='inline-flex items-center gap-2 px-6 py-3 bg-vesoko_dark_blue text-white rounded-xl font-medium'>
          <TrendingUp className='w-5 h-5' />
          Stay tuned for updates!
        </div>
      </div>
    </div>
  );

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {!MY_ORDERS_ENABLED ? (
        <ComingSoonSection />
      ) : (
        <div className='space-y-8'>
          {/* Modern Header */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-white/20 animate-fade-in'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <h1 className='text-3xl sm:text-4xl font-bold text-vesoko_dark_blue mb-2'>
                  📋 My Orders
                </h1>
                <p className='text-lg text-gray-600'>
                  Track and manage your sales orders efficiently
                </p>
              </div>
              
              <div className='flex flex-wrap gap-3'>
                <button
                  onClick={async () => await fetchData()}
                  disabled={isLoading}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className='hidden sm:inline'>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                
                <Link
                  href='/retailer/orders/new'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vesoko_dark_blue to-blue-600 hover:from-vesoko_dark_blue_2 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg'
                >
                  <Plus className='w-4 h-4' />
                  <span className='hidden sm:inline'>Create Order</span>
                </Link>
              </div>
            </div>
          </div>
      
      {/* Modern Order Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
        {[
          { label: 'Total Orders', status: 'All', gradient: 'from-blue-400 to-blue-600' },
          { label: 'Pending', status: 'Pending', gradient: 'from-yellow-400 to-orange-500' },
          { label: 'Processing', status: 'Processing', gradient: 'from-purple-400 to-purple-600' },
          { label: 'Shipped', status: 'Shipped', gradient: 'from-indigo-400 to-indigo-600' },
          { label: 'Delivered', status: 'Delivered', gradient: 'from-green-400 to-green-600' },
          { label: 'Cancelled', status: 'Canceled', gradient: 'from-red-400 to-red-600' }
        ].map((stat, index) => {
          let value = 0;
          if (stat.status === 'All') {
            value = orderStats.reduce((sum, s) => sum + s.count, 0);
          } else {
            const found = orderStats.find(s => s.status === stat.status);
            value = found ? found.count : 0;
          }
          return (
            <div 
              key={stat.label}
              className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up`}
              style={{animationDelay: `${index * 50}ms`}}
            >
              <div className='text-center'>
                <div className='text-2xl font-bold mb-1'>{value}</div>
                <div className='text-xs font-medium opacity-90'>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Search field and Filter Dropdown*/}
      <TableFilters>
        <BulkDeleteButton
          onClick={() => setIsBulkDeleteModalOpen(true)}
          isDisabled={selectedRows.length === 0}
        />

        {/* Filter by status */}
        <StatusFilters
          label='Filter by Status'
          options={[
            { value: 'All', label: 'All' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Fulfilled', label: 'Fulfilled' },
            { value: 'Shipped', label: 'Shipped' },
            { value: 'Delivered', label: 'Delivered' },
            { value: 'Canceled', label: 'Canceled' },
          ]}
          selectedOption={statusFilter}
          onChange={handleStatusFilterChange}
        />

        {/* Filter by dates (always on large, conditional on small) */}
        <div className='md:block block'>
          {showMoreFilters || (typeof window !== 'undefined' && window.innerWidth >= 768) ? ( // Condition for visibility
            <DateFilters
              label='Filter by Date Range'
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />
          ) : null}
        </div>
        {/* TODO: Currently disabled. Can be used if we have to more filters.
         Filter by dates (always on large, conditional on small) */}
        {/* <button
          onClick={toggleMoreFilters}
          className='hidden sm:inline text-sm text-vesoko_dark_blue underline'
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </button> */}
        {/* Clear Filters Button */}
        <ClearFilters clearFiltersFunction={clearFilters} />
      </TableFilters>
      <SearchField
        searchFieldPlaceholder='my orders'
        onSearchChange={handleSearchChange}
      />

      {/* Modern Orders Table */}
      <ModernTable
        columns={tableColumns}
        rows={tableRows}
        loading={isLoading}
        loadingMessage="Loading orders..."
        emptyMessage="No orders found"
        emptyIcon={<Package className="w-12 h-12" />}
        hasSelectAll={true}
        selectedRows={selectedRows}
        onSelectAll={handleSelectAllRows}
        onSelectRow={handleSelectRow}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        isExpandable={true}
        striped={true}
        hover={true}
        minRows={5}
        className="mb-6"
      />
      <Pagination
        data={filteredOrders}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* More Details Modal */}
        {isMoreOrderDetailsModalOpen && currentRowData && (
          <MoreOrderDetailsModal
            isOpen={isMoreOrderDetailsModalOpen}
            rowData={currentRowData}
            onClose={handleCloseMoreOrderDetailsModal}
            // onSave={handleSaveUpdatedRow}
          />
        )}

        {/* Update Row Modal */}
        {isUpdateModalOpen && currentRowData && (
          <UpdateRowModal
            isOpen={isUpdateModalOpen}
            rowData={currentRowData}
            onClose={handleCloseUpdateModal}
            onSave={handleSaveUpdatedRow}
          />
        )}
        {/* Delete Row Modal */}
        {isDeleteModalOpen && currentRowData && (
          <DeleteRowModal
            isOpen={isDeleteModalOpen}
            rowData={currentRowData}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={() => handleConfirmDelete(currentRowData._id)}
          />
        )}
        {/* Archive Row Modal */}
        {isArchiveModalOpen && currentRowData && (
          <ArchiveRowModal
            isOpen={isArchiveModalOpen}
            rowData={currentRowData}
            onClose={() => setIsArchiveModalOpen(false)}
            onArchive={() => handleConfirmArchive(currentRowData._id)}
          />
        )}
        {/* Bulk Delete Confirmation Modal */}
        <BulkDeleteModal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          onConfirm={handleBulkDelete}
        />
        {/* Success Message */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
          {/* Error Message */}
          {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
        </div>
      )}
    </div>
  );
};

export default SellerMyOrders;

import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/Charts/MetricCard';
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
import { handleError } from '@/utils/errorUtils';
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';
import { fetchCustomerOrders } from '@/utils/order/fetchCustomerOrders';
import { calculateOrderStats } from '@/utils/orderUtils';
import { sortItems } from '@/utils/sortItems';
import { 
  RotateCcw, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  DollarSign,
  TrendingUp,
  Users,
  ShoppingBag,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Calendar,
  Download,
  MoreHorizontal,
  Mail,
  FileText,
  MapPin,
  Archive,
  Printer,
  Send,
  ExternalLink,
  RefreshCw,
  Ban
} from 'lucide-react';
import {
  getShippingRates,
  createSubOrderLabel,
  updateSubOrderStatus,
  markSubOrderAsShipped,
  emailShippingLabel,
  saveShippingLabel
} from '@/utils/shipping/shippingActions';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { stateProps, SubOrderProps, UserProps } from '../../type';
import Button from './FormInputs/Button';
import Loading from './Loaders/Loading';
import CustomerMoreOrderDetailsModal from './Order/CustomerMoreOrderDetailsModal';
import SuccessMessageModal from './SuccessMessageModal';
import BulkDeleteButton from './Table/BulkDeleteButton';
import BulkDeleteModal from './Table/BulkDeleteModal';
import { fetchCustomerById } from '@/utils/customer/fetchCustomerById';
import { getSingleOrder } from '@/utils/order/getSingleOrder';
import { getSellerSingleOrder } from '@/utils/order/getSellerSingleOrder';
import { useSelector } from 'react-redux';
import { get } from 'http';
import { getStore } from '@/utils/store/getStore';
import { store } from '@/redux/store';

const SellerCustomerOrders = () => {
  const [customerOrders, setCustomerOrders] = useState<SubOrderProps[]>([]);
    const { userInfo, storeInfo } = useSelector((state: stateProps) => state.next);
  const [filteredOrders, setFilteredOrders] = useState<SubOrderProps[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<SubOrderProps | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [shippingLabel, setShippingLabel] = useState<any>(null);
  const [labelActionType, setLabelActionType] = useState<'print' | 'save' | 'email' | null>(null);
  const [creatingLabel, setCreatingLabel] = useState<string | null>(null); // Track which order is creating a label

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
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

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
    { id: 'customer', title: 'Customer', sortable: true, width: '120px' },
    { id: 'products', title: 'Items', sortable: true, width: '80px', align: 'center' },
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

  //for table row dropdown actions i.e: update, remove
  const [
    isCustomerMoreOrderDetailsModalOpen,
    setIsCustomerMoreOrderDetailsModalOpen,
  ] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<(SubOrderProps & { buyer?: UserProps }) | null>(null);
  const [isLoading, setIsLoading] = useState(false); // State for loading

  //setting customer orders data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const customerOrdersData = await fetchCustomerOrders();
      setCustomerOrders(customerOrdersData);
      setFilteredOrders(customerOrdersData); // Initially show all orders
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false); // Set loading to false *after* fetch completes (success or error)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders based on search query and selected status
  useEffect(() => {
    const flteredBySearching = customerOrders.filter((order) => {
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
  }, [searchQuery, statusFilter, customerOrders]);

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
      const filteredByStatusFiltering = customerOrders.filter(
        (order) => order.fulfillmentStatus === status.value
      );
      setFilteredOrders(filteredByStatusFiltering);
    } else {
      setFilteredOrders(customerOrders); // Reset to all orders if no filter
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
    const filtered = customerOrders.filter((order) => {
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
    setFilteredOrders(customerOrders); // Reset to all orders
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

  const handleCustomerMoreOrderDetails = async (rowData: SubOrderProps) => {
    // Fetch buyer details using buyerId
    let buyer: UserProps | undefined = undefined;
    if (rowData.buyerId) {
      const fetchedBuyer = await fetchCustomerById(rowData.buyerId);
      if (fetchedBuyer) buyer = fetchedBuyer;
    }
    setCurrentRowData({ ...rowData, buyer });
    setIsCustomerMoreOrderDetailsModalOpen(true);
  };
  const handleCloseCustomerMoreOrderDetailsModal = () => {
    setIsCustomerMoreOrderDetailsModalOpen(false);
  };

  const handleUpdate = (rowData: SubOrderProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
  };
  // const handleSaveUpdatedRow = (updatedRow: SubOrderProps) => {
  //   // Update filteredOrders to reflect the updated row
  //   setFilteredOrders((prevOrders) =>
  //     prevOrders.map((order) =>
  //       order._id === updatedRow._id ? { ...order, ...updatedRow } : order
  //     )
  //   );
  //   setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
  //   setIsUpdateModalOpen(false); // Close the modal after saving
  //   setTimeout(() => setSuccessMessage(''), 4000);
  // };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleAcceptOrder = async (order: SubOrderProps) => {
    try {
      await updateSubOrderStatus(order._id, {
        fulfillmentStatus: 'Processing'
      });
      const updatedOrders = customerOrders.map(o => 
        o._id === order._id ? { ...o, fulfillmentStatus: 'Processing' } : o
      );
      setCustomerOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSuccessMessage('Order status updated to Processing');
    } catch (error) {
      handleError(error);
    }
  };

  const handleCreateShippingLabel = async (order: SubOrderProps) => {
    setSelectedOrder(order);
    setCreatingLabel(order._id); // Set loading state for this specific order
    try {
      setSuccessMessage('Creating shipping label...');
      
      const response = await createSubOrderLabel(order._id);
      if (!response || !response.success || !response.transaction) {
        setSuccessMessage('Failed to create shipping label. Please try again.');
        return;
      }
      const  transaction  = response.transaction;
      setShippingLabel(transaction);
      
      // Update order with tracking info
      await updateSubOrderStatus(order._id, {
        fulfillmentStatus: 'Awaiting Shipment',
        trackingNumber: response.trackingNumber,
        labelUrl: response.labelUrl,
        trackingUrlProvider: response.trackingUrl,
        carrier: response.carrier || 'Unknown'
      });

      // Refresh orders list
      const updatedOrders = customerOrders.map(o =>
        o._id === order._id ? {
          ...o,
          fulfillmentStatus: 'Awaiting Shipment',
          shippingDetails: {
            trackingNumber: response.trackingNumber,
            labelUrl: response.labelUrl,
            trackingUrlProvider: response.trackingUrl,
            carrier: response.carrier || 'Unknown'
          }
        } : o
      );
      setCustomerOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSuccessMessage('Shipping label created successfully!');
      
      // Show label options modal
      setShowShippingModal(true);
      
    } catch (error) {
      console.error('Error creating shipping label:', error);
      setSuccessMessage('Failed to create shipping label. Please try again.');
      handleError(error);
    } finally {
      setCreatingLabel(null); // Clear loading state
    }
  };


  const handleLabelAction = async () => {
    if (!shippingLabel || !selectedOrder) return;

    // console.log('Handling label action:', shippingLabel, selectedOrder);

    try {
      switch (labelActionType) {
        case 'print':
          window.open(shippingLabel.labelUrl, '_blank');
          break;
        case 'save':
          await saveShippingLabel(shippingLabel.labelUrl, selectedOrder._id);
          setSuccessMessage('Shipping label saved');
          break;
        case 'email':
          console.log('Store info email:', storeInfo.email);
          console.log('Shipping label URL:', shippingLabel.labelUrl);
          console.log('Selected order seller email:', selectedOrder.sellerStoreId?.email);
          await emailShippingLabel(shippingLabel.labelUrl, selectedOrder.sellerStoreId?.email || storeInfo.email);
          setSuccessMessage('Shipping label sent to email');
          break;
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleMarkShipped = async (order: SubOrderProps) => {
    try {
      if (!order.shippingDetails?.trackingNumber || !order.shippingDetails?.carrier) {
        setSuccessMessage('Cannot mark as shipped: Tracking number and carrier are required');
        return;
      }
      
      await markSubOrderAsShipped(order._id, {
        trackingNumber: order.shippingDetails.trackingNumber,
        carrier: order.shippingDetails.carrier
      });
      const updatedOrders = customerOrders.map(o =>
        o._id === order._id ? { ...o, fulfillmentStatus: 'Shipped' } : o
      );
      setCustomerOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSuccessMessage('Order marked as shipped');
    } catch (error) {
      handleError(error);
    }
  };

  // Additional order workflow handlers
  const handleRejectOrder = async (order: SubOrderProps) => {
    try {
      await updateSubOrderStatus(order._id, {
        fulfillmentStatus: 'Cancelled',
        cancelReason: 'Seller rejected order'
      });
      const updatedOrders = customerOrders.map(o =>
        o._id === order._id ? { ...o, fulfillmentStatus: 'Cancelled' } : o
      );
      setCustomerOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSuccessMessage('Order has been rejected');
    } catch (error) {
      handleError(error);
    }
  };

  const handleMarkReadyToShip = async (order: SubOrderProps) => {
    try {
      await updateSubOrderStatus(order._id, {
        fulfillmentStatus: 'Ready to Ship'
      });
      const updatedOrders = customerOrders.map(o =>
        o._id === order._id ? { ...o, fulfillmentStatus: 'Ready to Ship' } : o
      );
      setCustomerOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSuccessMessage('Order marked as ready to ship');
    } catch (error) {
      handleError(error);
    }
  };

  const handleResendLabelEmail = async (order: SubOrderProps) => {
    try {
      console.log('Order', order);
      if (order.shippingDetails?.labelUrl) {
        await emailShippingLabel(order.shippingDetails.labelUrl, storeInfo.email);
        setSuccessMessage('Shipping label has been resent to your email');
      } else {
        setSuccessMessage('No shipping label found for this order');
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleTrackPackage = (order: SubOrderProps) => {
    if (order.shippingDetails?.trackingNumber) {
      const carrier = order.shippingDetails.carrier?.toLowerCase();
      let trackingUrl = '';
      
      // Generate tracking URL based on carrier
      switch (carrier) {
        case 'ups':
          trackingUrl = `https://www.ups.com/track?tracknum=${order.shippingDetails.trackingNumber}`;
          break;
        case 'fedex':
          trackingUrl = `https://www.fedex.com/fedextrack/?tracknumbers=${order.shippingDetails.trackingNumber}`;
          break;
        case 'usps':
          trackingUrl = `https://tools.usps.com/go/TrackConfirmAction_input?qtc_tLabels1=${order.shippingDetails.trackingNumber}`;
          break;
        default:
          trackingUrl = `https://www.google.com/search?q=track+package+${order.shippingDetails.trackingNumber}`;
      }
      
      window.open(trackingUrl, '_blank');
    } else {
      setSuccessMessage('No tracking number available for this order');
    }
  };

  const handleMarkDelivered = async (order: SubOrderProps) => {
    try {
      await updateSubOrderStatus(order._id, {
        fulfillmentStatus: 'Delivered'
      });
      const updatedOrders = customerOrders.map(o =>
        o._id === order._id ? { ...o, fulfillmentStatus: 'Delivered' } : o
      );
      setCustomerOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setSuccessMessage('Order marked as delivered');
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdateTracking = async (order: SubOrderProps) => {
    const newTrackingNumber = prompt('Enter new tracking number:', order.shippingDetails?.trackingNumber || '');
    if (newTrackingNumber && newTrackingNumber.trim()) {
      try {
        await updateSubOrderStatus(order._id, {
          trackingNumber: newTrackingNumber.trim(),
          carrier: order.shippingDetails?.carrier
        });
        const updatedOrders = customerOrders.map(o =>
          o._id === order._id ? {
            ...o,
            shippingDetails: {
              ...o.shippingDetails,
              trackingNumber: newTrackingNumber.trim()
            }
          } : o
        );
        setCustomerOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        setSuccessMessage('Tracking number updated successfully');
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleGenerateInvoice = async (order: SubOrderProps) => {
    try {
      // Fetch full order details
      const fullOrder = await getSellerSingleOrder(order._id);
      if (!fullOrder) {
        setSuccessMessage('Unable to load order details for invoice generation');
        return;
      }

      // Generate invoice HTML
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order #${order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VeSoko Invoice</h1>
            <h2>Order #${order._id}</h2>
            <p>Date: ${formatDate(order.createdAt)}</p>
          </div>
          
          <div class="order-info">
            <div>
              <h3>Store Information</h3>
              <p><strong>Store:</strong> ${storeInfo?.name || 'Store Name'}</p>
              <p><strong>Email:</strong> ${storeInfo?.email || 'store@example.com'}</p>
            </div>
            <div>
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Status:</strong> ${order.fulfillmentStatus}</p>
              <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${order.totalAmount.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>$${order.totalTax.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>$${order.totalShipping.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>$${(order.totalAmount + order.totalTax + order.totalShipping).toFixed(2)}</span>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              const printBtn = document.createElement('button');
              printBtn.innerHTML = 'Print Invoice';
              printBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
              printBtn.onclick = () => window.print();
              document.body.appendChild(printBtn);
              
              window.addEventListener('beforeprint', () => printBtn.style.display = 'none');
              window.addEventListener('afterprint', () => printBtn.style.display = 'block');
            };
          </script>
        </body>
        </html>
      `;
      
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setSuccessMessage('Invoice generated successfully');
    } catch (error) {
      handleError(error);
    }
  };

  const handleContactCustomer = async (order: SubOrderProps) => {
    try {
      const customer = await fetchCustomerById(order.buyerId);
      if (customer?.email) {
        const subject = `Regarding your order #${order._id}`;
        const body = `Hello ${customer.firstName || 'Customer'},\n\nWe wanted to reach out regarding your recent order #${order._id}.\n\nCurrent Status: ${order.fulfillmentStatus}\n\nIf you have any questions or concerns, please don't hesitate to reply to this email.\n\nBest regards,\n${storeInfo?.name || 'Store Team'}`;
        
        const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
      } else {
        setSuccessMessage('Customer email not available');
      }
    } catch (error) {
      setSuccessMessage('Unable to fetch customer contact information');
      handleError(error);
    }
  };

  const handleDelete = (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
  };

  const handleDeleteClick = (rowData: SubOrderProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsDeleteModalOpen(true); // Open the modal
  };

  const handleConfirmDelete = (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );

    setSuccessMessage(`Order # ${id} deleted successfully.`);

    //TODO: Delete from database
    setIsDeleteModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
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
      // await Promise.all(
      //   selectedRows.map((id) => deleteCustomerOrder(userInfo, id))
      // );

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
  const generateActionItems = (order: SubOrderProps): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        variant: 'primary',
        onClick: () => handleCustomerMoreOrderDetails(order),
      },
    ];

    // Placed Status Actions
    if (order.fulfillmentStatus === 'Placed') {
      actions.push(
        {
          label: 'Accept Order',
          icon: <CheckCircle className="w-4 h-4" />,
          variant: 'success',
          onClick: () => handleAcceptOrder(order),
        },
        {
          label: 'Reject Order',
          icon: <Ban className="w-4 h-4" />,
          variant: 'danger',
          onClick: () => handleRejectOrder(order),
          divider: true,
        }
      );
    }

    // Processing Status Actions
    if (order.fulfillmentStatus === 'Processing') {
      actions.push(
        {
          label: creatingLabel === order._id ? 'Creating Label...' : 'Create Shipping Label',
          icon: creatingLabel === order._id ? <RefreshCw className="w-4 h-4" /> : <Package className="w-4 h-4" />,
          variant: 'primary',
          loading: creatingLabel === order._id,
          disabled: creatingLabel === order._id,
          onClick: () => handleCreateShippingLabel(order),
        },
        {
          label: 'Mark as Ready to Ship',
          icon: <Truck className="w-4 h-4" />,
          variant: 'secondary',
          onClick: () => handleMarkReadyToShip(order),
          divider: true,
        }
      );
    }

    // Awaiting Shipment Actions
    if (order.fulfillmentStatus === 'Awaiting Shipment') {
      actions.push(
        {
          label: 'Mark as Shipped',
          icon: <Truck className="w-4 h-4" />,
          variant: 'success',
          onClick: () => handleMarkShipped(order),
        },
        {
          label: 'View Shipping Label',
          icon: <ExternalLink className="w-4 h-4" />,
          variant: 'secondary',
          onClick: () => window.open(order.shippingDetails?.labelUrl, '_blank'),
          
        },
        {
          label: 'Resend Label Email',
          icon: <Send className="w-4 h-4" />,
          variant: 'secondary',
          onClick: () => handleResendLabelEmail(order),
          divider: true,
        }
      );
    }

    // Shipped Status Actions
    if (order.fulfillmentStatus === 'Shipped') {
      actions.push(
        {
          label: 'Track Package',
          icon: <MapPin className="w-4 h-4" />,
          variant: 'primary',
          onClick: () => handleTrackPackage(order),
        },
        {
          label: 'Mark as Delivered',
          icon: <CheckCircle className="w-4 h-4" />,
          variant: 'success',
          onClick: () => handleMarkDelivered(order),
        },
        {
          label: 'Update Tracking',
          icon: <Edit className="w-4 h-4" />,
          variant: 'secondary',
          onClick: () => handleUpdateTracking(order),
          divider: true,
        }
      );
    }

    // Universal Actions (available for most statuses)
    if (order.fulfillmentStatus !== 'Cancelled' && order.fulfillmentStatus !== 'Delivered') {
      actions.push({
        label: 'Generate Invoice',
        icon: <FileText className="w-4 h-4" />,
        variant: 'secondary',
        onClick: () => handleGenerateInvoice(order),
      });
    }

    if (order.fulfillmentStatus !== 'Delivered' && order.fulfillmentStatus !== 'Cancelled') {
      actions.push({
        label: 'Contact Customer',
        icon: <Mail className="w-4 h-4" />,
        variant: 'secondary',
        onClick: () => handleContactCustomer(order),
        divider: true,
      });
    }

    // Always available actions
    actions.push(
      {
        label: 'Edit Order',
        icon: <Edit className="w-4 h-4" />,
        variant: 'secondary',
        onClick: () => handleUpdate(order),
      },
      {
        label: 'Archive',
        icon: <Archive className="w-4 h-4" />,
        variant: 'danger',
        onClick: () => handleDeleteClick(order),
      }
    );

    return actions;
  };

  // Convert orders to table rows
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
          content: order.buyerId || 'N/A',
        },
        {
          content: (
            <Link href="#" className="text-vesoko_dark_blue hover:underline">
              {order.products.length} {order.products.length === 1 ? 'item' : 'items'}
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
            {order.products.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 min-w-64"
              >
                <img
                  src={item.image}
                  alt={item.description || item.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {item.title || 'Title Missing'}
                  </p>
                  <p className="text-vesoko_gray_600 text-xs">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    }));

  return (
      <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
        <PageHeader
        heading='Customer Orders'
        actions={
          <div className='flex flex-wrap gap-2'>
            <Button
              icon={Download}
              buttonTitle='Export'
              buttonTitleClassName='hidden md:inline'
              className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50'
              disabled={true} // TODO: Implement export functionality
              // loadingButtonTitle='Exporting...'
              // isLoading={isLoading}
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export orders');
              }}
            />
            <Button
              isLoading={isLoading}
              icon={RotateCcw}
              buttonTitle='Refresh'
              buttonTitleClassName='hidden md:inline'
              loadingButtonTitle='Refreshing...'
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2'
              onClick={async () => {
                await fetchData();
              }}
            />
          </div>
        }
      />
      {/* Modern Metrics Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        <MetricCard
          title='Total Revenue'
          value={`$${formatPrice(totalRevenue)}`}
          icon={<DollarSign className='w-6 h-6' />}
          change={5}
          changeLabel='From last week'
          color='green'
        />
        <MetricCard
          title='Average Order Value'
          value={`$${formatPrice(averageOrderValue)}`}
          icon={<TrendingUp className='w-6 h-6' />}
          color='blue'
        />
        <MetricCard
          title='Total Orders'
          value={filteredOrders.length}
          icon={<ShoppingBag className='w-6 h-6' />}
          color='purple'
        />
        <MetricCard
          title='Recent Orders'
          value={recentOrders}
          icon={<Clock className='w-6 h-6' />}
          changeLabel='Last 7 days'
          color='indigo'
        />
      </div>

      {/* <TableActions /> */}

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
          {showMoreFilters || window.innerWidth >= 768 ? ( // Condition for visibility
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
        searchFieldPlaceholder='customer orders'
        onSearchChange={handleSearchChange}
      />

      {/* Rows per page selector */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * pageSize + 1, filteredOrders.length)} to {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} results
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              const newPageSize = Number(e.target.value);
              setPageSize(newPageSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Customer Orders Table */}
      <ModernTable
        columns={tableColumns}
        rows={tableRows}
        loading={isLoading}
        loadingMessage="Loading customer orders..."
        emptyMessage="No customer orders found"
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

        {/* Shipping Label Actions Modal */}
        {showShippingModal && shippingLabel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Shipping Label Created!</h2>
                <p className="text-gray-600 mt-2">
                  Your shipping label has been successfully generated. What would you like to do next?
                </p>
              </div>
              
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-3 bg-vesoko_green_500 text-white rounded-lg hover:bg-vesoko_green_700 transition-colors font-medium flex items-center justify-center gap-2"
                  onClick={() => {
                    setLabelActionType('print');
                    handleLabelAction();
                  }}
                >
                  <Download className="w-5 h-5" />
                  Print Label Now
                </button>
                
                <button
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  onClick={() => {
                    setLabelActionType('save');
                    handleLabelAction();
                  }}
                >
                  <Package className="w-5 h-5" />
                  Save for Later
                </button>
                
                <button
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  onClick={() => {
                    setLabelActionType('email');
                    handleLabelAction();
                  }}
                >
                  <Eye className="w-5 h-5" />
                  Email to Me
                </button>
              </div>
              
              {shippingLabel?.trackingNumber && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tracking Information</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Tracking Number:</strong> {shippingLabel.trackingNumber}</p>
                    <p><strong>Carrier:</strong> {selectedOrder?.trackingInfo?.carrier || 'Unknown'}</p>
                  </div>
                </div>
              )}

              <button
                className="mt-6 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowShippingModal(false);
                  setSelectedOrder(null);
                  setShippingRates([]);
                  setSelectedRate(null);
                  setShippingLabel(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* More Details Modal */}
        {isCustomerMoreOrderDetailsModalOpen && currentRowData && (
          <CustomerMoreOrderDetailsModal
            isOpen={isCustomerMoreOrderDetailsModalOpen}
            rowData={currentRowData as SubOrderProps & { buyer: UserProps }}
            onClose={handleCloseCustomerMoreOrderDetailsModal}
          />
        )}
        {/* Update Row Modal */}
        {/* <UpdateRowModal
          isOpen={isUpdateModalOpen}
          rowData={currentRowData}
          onClose={handleCloseUpdateModal}
          onSave={handleSaveUpdatedRow}
        /> */}
        {/* Delete Row Modal */}
        {isDeleteModalOpen && currentRowData && (
          <DeleteRowModal
            isOpen={isDeleteModalOpen}
            rowData={currentRowData}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={() => handleConfirmDelete(currentRowData._id)}
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
      </div>

  );
};

export default SellerCustomerOrders;

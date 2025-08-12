import ErrorMessageModal from '@/components/ErrorMessageModal';
import Button from '@/components/FormInputs/Button';
import Loading from '@/components/Loaders/Loading';
import PageHeader from '@/components/PageHeader';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ModernTable, { TableRow } from '@/components/Table/ModernTable';
import { TableColumn } from '@/components/Table/TableHeader';
import { TableCellData } from '@/components/Table/TableBodyRow';
import ApproveRowModal from '@/components/Table/ApproveRowModal';
import BulkDeleteButton from '@/components/Table/BulkDeleteButton';
import BulkDeleteModal from '@/components/Table/BulkDeleteModal';
import DeleteRowModal from '@/components/Table/DeleteRowModal';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import SearchField from '@/components/Table/SearchField';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import { approveStoreApplication } from '@/utils/admin/approveStoreApplication';
import { declineStoreApplication } from '@/utils/admin/declineStoreApplication';
import { deleteStoreApplication } from '@/utils/admin/deleteStoreApplication';
import { getStoreApplicationsAnalytics, StoreApplicationsAnalytics } from '@/utils/admin/getStoreApplicationsAnalytics';
import { handleError } from '@/utils/errorUtils';
import { RotateCcw, Users, Clock, CheckCircle, XCircle, TrendingUp, Eye, Download, Check, X, Trash2, BarChart3, MapPin, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from './layout';
import { StoreApplicationProps } from '../../../type';
import formatDate from '../../utils/formatDate';
import { sortItems } from '../../utils/sortItems';
import { getAllStoreApplications } from '../../utils/store/getAllStoreApplications';

const StoreApplications = () => {
  const router = useRouter();
  // State
  const [storeApplications, setStoreApplications] = useState<StoreApplicationProps[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<StoreApplicationProps[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<{ value: string; label: string } | null>({ value: 'All', label: 'All' });
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<StoreApplicationProps | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [analytics, setAnalytics] = useState<StoreApplicationsAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Table columns for ModernTable
  const tableColumns: TableColumn[] = [
    { id: 'status', title: 'Status', sortable: true, width: '120px' },
    { id: '_id', title: 'Application ID', sortable: true, width: '140px' },
    { id: 'storeName', title: 'Store Name', sortable: true, width: '200px' },
    { id: 'storeType', title: 'Type', sortable: true, width: '150px' },
    { id: 'ownerName', title: 'Owner', sortable: true, width: '180px' },
    { id: 'submittedAt', title: 'Submitted', sortable: true, width: '120px' },
    { id: 'updatedAt', title: 'Updated', sortable: true, width: '120px' },
    { id: 'action', title: 'Actions', sortable: false, width: '120px' },
  ];

  // Convert applications to table rows
  const getTableRows = (): TableRow[] => {
    return filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((application) => {
      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case 'approved': return 'success';
          case 'pending': return 'warning';
          case 'declined': return 'danger';
          default: return 'neutral';
        }
      };

      const cells: TableCellData[] = [
        {
          content: application.status,
          isStatus: true,
          statusVariant: getStatusVariant(application.status)
        },
        { content: application._id?.substring(0, 8) + '...' || 'N/A' },
        { content: application.storeInfo?.name || 'N/A' },
        { content: application.storeInfo?.storeType || 'N/A' },
        {
          content: `${application.primaryContactInfo?.firstName || ''} ${application.primaryContactInfo?.lastName || ''}`.trim() || 'N/A'
        },
        { content: formatDate(application.createdAt) },
        { content: formatDate(application.updatedAt) },
        {
          content: (
            <div data-interactive className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/admin/store-application-details?id=${application._id}`)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownload(application)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              {application.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleApproveApplication(application)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeclineApplication(application)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteClick(application)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )
        },
      ];

      return {
        id: application._id as string,
        data: application,
        cells,
      };
    });
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const analyticsData = await getStoreApplicationsAnalytics();
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      handleError(error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [storeApplicationsData] = await Promise.all([
        getAllStoreApplications(),
        fetchAnalytics()
      ]);
      setStoreApplications(storeApplicationsData);
      setFilteredApplications(storeApplicationsData);
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  // Filtering
  useEffect(() => {
    const filtered = storeApplications.filter((application) => {
      const searchMatch = Object.values(application).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch =
        statusFilter === null ||
        (statusFilter.value === 'All' && statusFilter.label === 'All') ||
        application.status === statusFilter.value;
      return searchMatch && statusMatch;
    });
    setFilteredApplications(filtered);
  }, [searchQuery, statusFilter, storeApplications]);

  // Handlers
  const handleSearchChange = (query: string) => setSearchQuery(query);
  const handleStatusFilterChange = (status: { value: string; label: string } | null) => {
    setStatusFilter(status);
    if (status && status.value !== 'All') {
      setFilteredApplications(storeApplications.filter((application) => application.status === status.value));
    } else {
      setFilteredApplications(storeApplications);
    }
  };
  const handleStartDateChange = (value: string) => { setStartDate(value); applyDateFilter(value, endDate); };
  const handleEndDateChange = (value: string) => { setEndDate(value); applyDateFilter(startDate, value); };
  const applyDateFilter = (start: string, end: string) => {
    const filtered = storeApplications.filter((application) => {
      const createdDate = application.createdAt;
      const isAfterStart = start ? createdDate >= start : true;
      const isBeforeEnd = end ? createdDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
    setFilteredApplications(filtered);
  };
  const clearFilters = () => {
    setStatusFilter({ value: 'All', label: 'All' });
    setStartDate('');
    setEndDate('');
    setFilteredApplications(storeApplications);
  };
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSort = (column: string) => {
    const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newSortOrder);
    setFilteredApplications(sortItems(filteredApplications, column, newSortOrder));
  };
  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]);
  };
  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredApplications.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredApplications.map((item) => item._id as string));
    }
  };
  const handleBulkDelete = async () => {
    setFilteredApplications((prev) => prev.filter((item) => !selectedRows.includes(item._id as string)));
    setSelectedRows([]);
    setSuccessMessage('Selected items deleted successfully.');
    setIsBulkDeleteModalOpen(false);
  };
  const handleApproveApplication = (rowData: StoreApplicationProps) => { setCurrentRowData(rowData); setIsApproveModalOpen(true); };
  const handleDeclineApplication = (rowData: StoreApplicationProps) => {
    setCurrentRowData(rowData);
    setIsDeclineModalOpen(true);
    setDeclineReason('');
  };
  const handleSaveUpdatedRow = (updatedRow: StoreApplicationProps) => {
    setFilteredApplications((prev) => prev.map((application) => application._id === updatedRow._id ? { ...application, ...updatedRow } : application));
    setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
    setIsApproveModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };
  const handleCloseApproveModal = () => setIsApproveModalOpen(false);
  const handleDeleteClick = (rowData: StoreApplicationProps) => { setCurrentRowData(rowData); setIsDeleteModalOpen(true); };
  const handleDelete = (id: string) => {
    setFilteredApplications((prev) => prev.filter((application) => application._id !== id));
  };
  const handleConfirmDelete = async (id: string) => {
    try {
      const response = await deleteStoreApplication(id);
      if (response.status !== 200) {
        setSuccessMessage('');
        setErrorMessage(response.data.msg || 'Delete application failed.');
      } else {
        setSuccessMessage(`Application with ID # ${id} deleted successfully.`);
        setIsDeleteModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchData(); // Refresh data from backend
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    }
  };
  const handleConfirmApprove = async (id: string) => {
    try {
      const response = await approveStoreApplication(id);
      if (response.status !== 200) {
        setSuccessMessage('');
        setErrorMessage(response.data.msg || 'Approve application failed.');
      } else {
        setSuccessMessage(`Application with ID # ${id} approved successfully.`);
        setIsApproveModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchData();
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    }
  };

  const handleConfirmDecline = async (id: string) => {
    try {
      const response = await declineStoreApplication(id, declineReason);
      if (response.status !== 200) {
        setSuccessMessage('');
        setErrorMessage(response.data.msg || 'Decline application failed.');
      } else {
        setSuccessMessage(`Application with ID # ${id} declined successfully.`);
        setIsDeclineModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchData();
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    }
  };
  // View/Download handlers
  const handleViewApplication = (rowData: StoreApplicationProps) => { setCurrentRowData(rowData); setIsViewModalOpen(true); };
  const handleCloseViewModal = () => { setIsViewModalOpen(false); setCurrentRowData(null); };
  const handleDownload = (rowData: StoreApplicationProps) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rowData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `store-application-${rowData._id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <AdminLayout>
      <PageHeader
        heading='Store Applications Management'
        actions={
          <Button
            isLoading={isLoading || analyticsLoading}
            icon={RotateCcw}
            buttonTitle='Refresh'
            buttonTitleClassName='hidden md:inline'
            loadingButtonTitle='Refreshing...'
            className='text-vesoko_dark_blue hover:text-white hover:bg-vesoko_dark_blue'
            onClick={async () => { await fetchData(); }}
          />
        }
      />

      {/* Analytics Dashboard */}
      <div className="space-y-6 mb-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analyticsLoading ? '...' : analytics?.statusCounts.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {analyticsLoading ? '...' : analytics?.statusCounts.pending || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {analyticsLoading ? '...' : analytics?.statusCounts.approved || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Declined</p>
                <p className="text-3xl font-bold text-red-600">
                  {analyticsLoading ? '...' : analytics?.statusCounts.declined || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store Type Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-vesoko_dark_blue" />
              <h3 className="text-lg font-semibold text-gray-900">Store Types</h3>
            </div>
            <div className="space-y-3">
              {analyticsLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : analytics?.storeTypeBreakdown.length ? (
                analytics.storeTypeBreakdown.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span className="text-gray-700">{item._id || 'Unknown'}</span>
                    <span className="font-semibold text-vesoko_dark_blue">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No data available</div>
              )}
            </div>
          </div>

          {/* Country Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-vesoko_dark_blue" />
              <h3 className="text-lg font-semibold text-gray-900">Top Countries</h3>
            </div>
            <div className="space-y-3">
              {analyticsLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : analytics?.countryBreakdown.length ? (
                analytics.countryBreakdown.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span className="text-gray-700">{item._id || 'Unknown'}</span>
                    <span className="font-semibold text-vesoko_dark_blue">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No data available</div>
              )}
            </div>
          </div>

          {/* Processing Times */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-vesoko_dark_blue" />
              <h3 className="text-lg font-semibold text-gray-900">Avg Processing Time</h3>
            </div>
            <div className="space-y-3">
              {analyticsLoading ? (
                <div className="text-gray-500">Loading...</div>
              ) : analytics?.processingTimeData.length ? (
                analytics.processingTimeData.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span className="text-gray-700">{item._id}</span>
                    <span className="font-semibold text-vesoko_dark_blue">
                      {Math.round(item.avgProcessingTime)} days
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-slate-800 rounded-lg p-4 shadow mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <BulkDeleteButton onClick={() => setIsBulkDeleteModalOpen(true)} isDisabled={selectedRows.length === 0} />
          <StatusFilters label='Status' options={[
            { value: 'All', label: 'All' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Declined', label: 'Declined' },
          ]} selectedOption={statusFilter} onChange={handleStatusFilterChange} />
          <DateFilters label='Date Range' startDate={startDate} endDate={endDate} onStartDateChange={handleStartDateChange} onEndDateChange={handleEndDateChange} />
          <ClearFilters clearFiltersFunction={clearFilters} />
        </div>
        <div className="flex-1 flex justify-end">
          <SearchField searchFieldPlaceholder='Search Store Applications' onSearchChange={handleSearchChange} />
        </div>
      </div>

      {/* Modern Table */}
      <ModernTable
        columns={tableColumns}
        rows={getTableRows()}
        loading={isLoading}
        loadingMessage="Loading store applications..."
        emptyMessage="No store applications found"
        emptyIcon={<Users className="w-12 h-12" />}
        hasSelectAll={true}
        selectedRows={selectedRows}
        onSelectAll={handleSelectAllRows}
        onSelectRow={handleSelectRow}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
        className="mb-6"
        minRows={PAGE_SIZE}
      />

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredApplications.length)} to{' '}
          {Math.min(currentPage * PAGE_SIZE, filteredApplications.length)} of {filteredApplications.length} applications
        </div>
        <div className="flex gap-2">
          <Button
            buttonTitle="Previous"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
          />
          <Button
            buttonTitle="Next"
            disabled={currentPage >= Math.ceil(filteredApplications.length / PAGE_SIZE)}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 text-sm bg-vesoko_dark_blue hover:bg-vesoko_dark_blue/90 text-white disabled:opacity-50"
          />
        </div>
      </div>

      {/* Modals */}
      {isApproveModalOpen && currentRowData && currentRowData._id && (
        <ApproveRowModal 
          isOpen={isApproveModalOpen} 
          rowData={currentRowData} 
          onClose={handleCloseApproveModal} 
          onApprove={() => handleConfirmApprove(currentRowData._id as string)} 
        />
      )}
      {isDeleteModalOpen && currentRowData && currentRowData._id && (
        <DeleteRowModal 
          isOpen={isDeleteModalOpen} 
          rowData={currentRowData} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onDelete={() => handleConfirmDelete(currentRowData._id as string)} 
        />
      )}
      <BulkDeleteModal 
        isOpen={isBulkDeleteModalOpen} 
        onClose={() => setIsBulkDeleteModalOpen(false)} 
        onConfirm={handleBulkDelete} 
      />
      {isDeclineModalOpen && currentRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              className="absolute top-2 right-2 text-vesoko_red_600 hover:text-red-800 text-2xl font-bold" 
              onClick={() => setIsDeclineModalOpen(false)} 
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-vesoko_dark_blue">Decline Store Application</h2>
            <div className="mb-4">
              Are you sure you want to decline application{' '}
              <span className="font-semibold">{currentRowData._id}</span>?
            </div>
            <textarea
              className="w-full p-2 border rounded mb-4"
              rows={3}
              placeholder="Reason for declining (optional)"
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button 
                buttonTitle="Cancel" 
                className="bg-gray-200 text-gray-700" 
                onClick={() => setIsDeclineModalOpen(false)} 
              />
              <Button 
                buttonTitle="Decline" 
                className="bg-vesoko_red_600 text-white" 
                onClick={() => handleConfirmDecline(currentRowData._id as string)} 
              />
            </div>
          </div>
        </div>
      )}

      {successMessage && <SuccessMessageModal successMessage={successMessage} />}
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </AdminLayout>
  );
};

StoreApplications.noLayout = true;
export default StoreApplications;

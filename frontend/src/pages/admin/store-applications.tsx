import ErrorMessageModal from '@/components/ErrorMessageModal';
import Button from '@/components/FormInputs/Button';
import Loading from '@/components/Loaders/Loading';
import PageHeader from '@/components/PageHeader';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ApproveRowModal from '@/components/Table/ApproveRowModal';
import BulkDeleteButton from '@/components/Table/BulkDeleteButton';
import BulkDeleteModal from '@/components/Table/BulkDeleteModal';
import DeleteRowModal from '@/components/Table/DeleteRowModal';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import Pagination from '@/components/Table/Pagination';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import SearchField from '@/components/Table/SearchField';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import { approveStoreApplication } from '@/utils/admin/approveStoreApplication';
import { declineStoreApplication } from '@/utils/admin/declineStoreApplication';
import { handleError } from '@/utils/errorUtils';
import { RotateCcw } from 'lucide-react';
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
  const PAGE_SIZE = 5;
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<StoreApplicationProps | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Table columns
  const tableColumns = [
    { title: 'Status', id: 'status', sortable: true },
    { title: 'Application ID', id: '_id', sortable: true },
    { title: 'Store', id: 'storeName', sortable: true },
    { title: 'Type', id: 'storeType', sortable: true },
    { title: 'Owner', id: 'ownerName', sortable: true },
    { title: 'Submitted', id: 'submittedAt', sortable: true },
    { title: 'Updated', id: 'updatedAt', sortable: true },
    { title: 'Action', id: 'action' },
  ];

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeApplicationsData = await getAllStoreApplications();
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
  const handleConfirmDelete = (id: string) => {
    setFilteredApplications((prev) => prev.filter((application) => application._id !== id));
    setSuccessMessage(`Application with ID # ${id} deleted successfully.`);
    setIsDeleteModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
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
        heading='Store Applications'
        actions={
          <Button
            isLoading={isLoading}
            icon={RotateCcw}
            buttonTitle='Refresh'
            buttonTitleClassName='hidden md:inline'
            loadingButtonTitle='Refreshing...'
            className='text-vesoko_dark_blue hover:text-white hover:bg-vesoko_dark_blue'
            onClick={async () => { await fetchData(); }}
          />
        }
      />
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
      <div className='relative overflow-x-auto mt-4 shadow-xl rounded-xl bg-white dark:bg-slate-800 p-4'>
        <table id='store-applications-table' className='min-w-full text-sm text-left text-vesoko_gray_600 dark:text-gray-300'>
          <TableHead checked={selectedRows.length === filteredApplications.length} onChange={handleSelectAllRows} columns={tableColumns} handleSort={handleSort} />
          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={tableColumns.length} className="py-12 text-center">
                  <Loading message='Loading applications...' />
                </td>
              </tr>
            </tbody>
          ) : filteredApplications.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={tableColumns.length} className="py-12 text-center text-vesoko_red_600">
                  No applications found
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {filteredApplications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((application) => (
                <TableRow
                  key={application._id}
                  rowData={application}
                  rowValues={[
                    {
                      content: (
                        <input
                          type='checkbox'
                          checked={selectedRows.includes(application._id as string)}
                          onChange={() => handleSelectRow(application._id as string)}
                        />
                      ),
                    },
                    { content: application.status, isStatus: true },
                    { content: application._id },
                    { content: application.storeInfo.name },
                    { content: application.storeInfo.storeType },
                    { content: `${application.primaryContactInfo.firstName} ${application.primaryContactInfo.lastName}` },
                    { content: formatDate(application.createdAt) },
                    { content: formatDate(application.updatedAt) },
                    {
                      content: (
                        <RowActionDropdown
                          actions={[
                            { label: 'View', onClick: () => router.push(`/admin/store-application-details?id=${application._id}`) },
                            { label: 'Download', onClick: () => handleDownload(application) },
                            { label: 'Approve', onClick: () => handleApproveApplication(application) },
                            { label: 'Decline', onClick: () => handleDeclineApplication(application) },
                            { label: 'Delete', onClick: () => handleDeleteClick(application) },
                          ]}
                        />
                      ),
                    },
                  ]}
                  onUpdate={handleSaveUpdatedRow}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          )}
        </table>
        <Pagination data={filteredApplications} pageSize={PAGE_SIZE} onPageChange={handlePageChange} />
        {/* Modals */}
        {isApproveModalOpen && currentRowData && currentRowData._id && (
          <ApproveRowModal isOpen={isApproveModalOpen} rowData={currentRowData} onClose={handleCloseApproveModal} onApprove={() => handleConfirmApprove(currentRowData._id as string)} />
        )}
        {isDeleteModalOpen && currentRowData && currentRowData._id && (
          <DeleteRowModal isOpen={isDeleteModalOpen} rowData={currentRowData} onClose={() => setIsDeleteModalOpen(false)} onDelete={() => handleConfirmDelete(currentRowData._id as string)} />
        )}
        <BulkDeleteModal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} onConfirm={handleBulkDelete} />
        {isDeclineModalOpen && currentRowData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
              <button className="absolute top-2 right-2 text-vesoko_red_600 hover:text-red-800 text-2xl font-bold" onClick={() => setIsDeclineModalOpen(false)} aria-label="Close">&times;</button>
              <h2 className="text-xl font-bold mb-4 text-vesoko_dark_blue">Decline Store Application</h2>
              <div className="mb-4">Are you sure you want to decline application <span className="font-semibold">{currentRowData._id}</span>?</div>
              <textarea
                className="w-full p-2 border rounded mb-4"
                rows={3}
                placeholder="Reason for declining (optional)"
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button buttonTitle="Cancel" className="bg-gray-200 text-gray-700" onClick={() => setIsDeclineModalOpen(false)} />
                <Button buttonTitle="Decline" className="bg-vesoko_red_600 text-white" onClick={() => handleConfirmDecline(currentRowData._id as string)} />
              </div>
            </div>
          </div>
        )}
        {isViewModalOpen && currentRowData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
              <button className="absolute top-2 right-2 text-vesoko_red_600 hover:text-red-800 text-2xl font-bold" onClick={handleCloseViewModal} aria-label="Close">&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-vesoko_dark_blue">Store Application Details</h2>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">Application ID:</span> {currentRowData._id}</div>
                <div><span className="font-semibold">Status:</span> {currentRowData.status}</div>
                <div><span className="font-semibold">Store Name:</span> {currentRowData.storeInfo?.name}</div>
                <div><span className="font-semibold">Store Type:</span> {currentRowData.storeInfo?.storeType}</div>
                <div><span className="font-semibold">Owner:</span> {currentRowData.primaryContactInfo?.firstName} {currentRowData.primaryContactInfo?.lastName}</div>
                <div><span className="font-semibold">Submitted:</span> {formatDate(currentRowData.createdAt)}</div>
                <div><span className="font-semibold">Updated:</span> {formatDate(currentRowData.updatedAt)}</div>
                <div className="pt-2"><span className="font-semibold">Full Data:</span>
                  <pre className="bg-slate-100 dark:bg-slate-800 rounded p-2 mt-1 overflow-x-auto text-xs max-h-48">{JSON.stringify(currentRowData, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
        {successMessage && <SuccessMessageModal successMessage={successMessage} />}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
      </div>
    </AdminLayout>
  );
};

StoreApplications.noLayout = true;
export default StoreApplications;

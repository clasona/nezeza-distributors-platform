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
import TableFilters from '@/components/Table/TableFilters';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import { approveStoreApplication } from '@/utils/admin/approveStoreApplication';
import { handleError } from '@/utils/errorUtils';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminLayout from '.';
import { StoreApplicationProps } from '../../../type';
import formatDate from '../../utils/formatDate';
import { sortItems } from '../../utils/sortItems';
import { getAllStoreApplications } from '../../utils/store/getAllStoreApplications';

const StoreApplications = () => {
  const [storeApplications, setStoreApplications] = useState<
    StoreApplicationProps[]
  >([]);
  const [filteredApplications, setFilteredApplications] = useState<
    StoreApplicationProps[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

  // For sorting and filtering
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    label: string;
  } | null>({ value: 'All', label: 'All' });
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  //for defining what table headers needed
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

  //for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Adjust the page size as needed. useState() instead??

  //for bulk deleting
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  //for table row dropdown actions i.e: update, Delete
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentRowData, setCurrentRowData] =
    useState<StoreApplicationProps | null>(null);

  //setting applications data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const storeApplicationsData = await getAllStoreApplications();
      setStoreApplications(storeApplicationsData);
      setFilteredApplications(storeApplicationsData); // Initially show all applications
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Filter applications based on search query and selected status
  useEffect(() => {
    const flteredBySearching = storeApplications.filter((application) => {
      const searchMatch = Object.values(application)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const statusMatch =
        statusFilter === null ||
        (statusFilter.value === 'All' && statusFilter.label === 'All') ||
        application.status === statusFilter.value;
      return searchMatch && statusMatch;
    });

    setFilteredApplications(flteredBySearching);
  }, [searchQuery, statusFilter, storeApplications]);

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

    if (status && status.value !== 'All') {
      const filteredByStatusFiltering = storeApplications.filter(
        (application) => application.status === status.value
      );
      setFilteredApplications(filteredByStatusFiltering);
    } else {
      setFilteredApplications(storeApplications);
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
    const filtered = storeApplications.filter((application) => {
      const createdDate = application.createdAt; // YYYY-MM-DD format
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
    setFilteredApplications(storeApplications); // Reset to all applications
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (column: string) => {
    // Pre compute the next sort application and column to ensure that sortItems uses the updated values of sortColumn and sortOrder.
    // React state updates are asynchronous, which means that the updated sortColumn() and sortOrder()
    // may not immediately reflect in the subsequent sortItems call.
    const newSortOrder =
      sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    const newSortColumn = column;

    // Update state
    setSortColumn(newSortColumn);
    setSortOrder(newSortOrder);

    // Use the new values to sort immediately
    const sortedApplications = sortItems(
      filteredApplications,
      newSortColumn,
      newSortOrder
    );
    setFilteredApplications(sortedApplications);
  };

  const handleApproveApplication = (rowData: StoreApplicationProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsApproveModalOpen(true);
  };
  const handleSaveUpdatedRow = (updatedRow: StoreApplicationProps) => {
    setFilteredApplications((prevApplications) =>
      prevApplications.map((application) =>
        application._id === updatedRow._id
          ? { ...application, ...updatedRow }
          : application
      )
    );
    setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
    setIsApproveModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setFilteredApplications((prevApplications) =>
      prevApplications.filter((application) => application._id !== id)
    );
  };

  const handleDeleteClick = (rowData: StoreApplicationProps) => {
    setCurrentRowData(rowData);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setFilteredApplications((prevApplications) =>
      prevApplications.filter((application) => application._id !== id)
    );
    //TODO: Delete from database

    setSuccessMessage(`Application with ID # ${id} deleted successfully.`);
    setIsDeleteModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleConfirmApprove = async (id: string) => {
    try {
      const response = await approveStoreApplication(id);
      if (response.status !== 200) {
        setSuccessMessage(''); // Clear any previous error message
        setErrorMessage(response.data.msg || 'Approve application failed.');
      } else {
        setSuccessMessage(`Applicaton with ID # ${id} approved successfully.`);
        setIsApproveModalOpen(false);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    }
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
    if (selectedRows.length === filteredApplications.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredApplications.map((item) => item._id as string));
    }
  };

  const handleBulkDelete = async () => {
    try {
      // await Promise.all(
      //   selectedRows.map((id) => deleteStoreApplication(userInfo, id))
      // );

      setFilteredApplications((prevInventory) =>
        prevInventory.filter(
          (item) => !selectedRows.includes(item._id as string)
        )
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
            className='text-nezeza_dark_blue hover:text-white hover:bg-nezeza_dark_blue'
            onClick={async () => {
              await fetchData();
            }}
          />
        }
      />
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
            { value: 'Approved', label: 'Approved' },
            { value: 'Declined', label: 'Declined' },
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
          className='hidden sm:inline text-sm text-nezeza_dark_blue underline'
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </button> */}

        {/* Clear Filters Button */}
        <ClearFilters clearFiltersFunction={clearFilters} />
      </TableFilters>
      <SearchField
        searchFieldPlaceholder='store applications'
        onSearchChange={handleSearchChange}
      />

      {/* Store Applications Table */}
      <div className='relative overflow-x-auto mt-4 shadow-md sm:rounded-lg'>
        <table
          id='store-applications-table'
          className='w-full text-sm text-left rtl:text-right text-nezeza_gray_600 dark:text-gray-400'
        >
          <TableHead
            checked={selectedRows.length === filteredApplications.length}
            onChange={handleSelectAllRows}
            // hasCollapsibleContent={true}
            columns={tableColumns}
            handleSort={handleSort}
          />
          {isLoading ? ( // Show loading indicator
            <Loading message='store applications' />
          ) : filteredApplications.length === 0 ? (
            <p className='text-center'>No applications found</p>
          ) : (
            <tbody>
              {filteredApplications
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((application) => (
                  <TableRow
                    key={application._id}
                    //   hasCollapsibleContent={true}
                    rowData={application}
                    rowValues={[
                      {
                        content: (
                          <input
                            type='checkbox'
                            checked={selectedRows.includes(
                              application._id as string
                            )}
                            onChange={() =>
                              handleSelectRow(application._id as string)
                            }
                          />
                        ),
                      },
                      { content: application.status, isStatus: true },
                      { content: application._id },
                      { content: application.storeInfo.name },
                      { content: application.storeInfo.storeType },
                      {
                        content: `${application.primaryContactInfo.firstName} ${application.primaryContactInfo.lastName}`,
                      },
                      { content: formatDate(application.createdAt) },
                      { content: formatDate(application.updatedAt) },

                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              // {
                              //   label: 'View',
                              //   onClick: () =>
                              //     handleViewApplication(application), //TODO:Change
                              // },
                              {
                                label: 'Approve',
                                onClick: () =>
                                  handleApproveApplication(application),
                              },
                              // {
                              //   label: 'Decline',
                              //   onClick: () =>
                              //     handleDeclineApplication(application), //TODO:Change
                              // },
                              {
                                label: 'Delete',
                                onClick: () => handleDeleteClick(application), //TODO:Change
                              },
                            ]}
                          />
                        ),
                      },
                    ]}
                    onUpdate={handleSaveUpdatedRow}
                    onDelete={handleDelete}
                  />
                ))}
              ;
            </tbody>
          )}
        </table>
        <Pagination
          data={filteredApplications}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
        {/* Update Row Modal */}
        {isApproveModalOpen && currentRowData && currentRowData._id && (
          <ApproveRowModal
            isOpen={isApproveModalOpen}
            rowData={currentRowData}
            onClose={handleCloseApproveModal}
            onApprove={() => handleConfirmApprove(currentRowData._id as string)}
          />
        )}

        {/* Delete Row Modal */}
        {isDeleteModalOpen && currentRowData && currentRowData._id && (
          <DeleteRowModal
            isOpen={isDeleteModalOpen}
            rowData={currentRowData}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={() => handleConfirmDelete(currentRowData._id as string)}
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
    </AdminLayout>
  );
};

StoreApplications.noLayout = true;
export default StoreApplications;

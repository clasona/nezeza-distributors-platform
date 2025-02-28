import Button from '@/components/FormInputs/Button';
import Loading from '@/components/Loaders/Loading';
import PageHeader from '@/components/PageHeader';
import SuccessMessageModal from '@/components/SuccessMessageModal';
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
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import { useEffect, useState } from 'react';
import AdminLayout from '.';
import { StoreApplicationProps } from '../../../type';
import formatDate from '../../utils/formatDate';
import { formatIdByShortening } from '../../utils/formatId';
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
    const [showMoreFilters, setshowMoreFilters] = useState(false);
  const toggleMoreFilters = () => setshowMoreFilters((prev) => !prev);

  // For sorting and filtering
  const [statusFilter, setStatusFilter] = useState('Status');
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
    } catch (error) {
      console.error('Error fetching store applications data:', error);
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
        statusFilter === 'Status' || application.status === statusFilter;
      return searchMatch && statusMatch;
    });

    setFilteredApplications(flteredBySearching);
  }, [searchQuery, statusFilter, storeApplications]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query); // Update the search query
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    const filteredByStatusFiltering =
      status === 'Status'
        ? storeApplications
        : storeApplications.filter(
            (application) => application.status === status
          );

    setFilteredApplications(filteredByStatusFiltering);
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
    setStatusFilter('Status');
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

  const handleUpdate = (rowData: StoreApplicationProps) => {
    setCurrentRowData(rowData);
    // console.log(rowData);
    setIsUpdateModalOpen(true);
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
    setIsUpdateModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
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

    setSuccessMessage(`Order # ${id} deleted successfully.`);
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
    if (selectedRows.length === filteredApplications.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredApplications.map((item) => item._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      // await Promise.all(
      //   selectedRows.map((id) => deleteStoreApplication(userInfo, id))
      // );

      setFilteredApplications((prevInventory) =>
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

  return (
    <AdminLayout>
      <PageHeader
        heading='Store Applications'
        actions={
          <Button
            isLoading={isLoading}
            buttonTitle='Refresh'
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
        <SearchField
          searchFieldPlaceholder='store applications'
          onSearchChange={handleSearchChange}
        />
        {/* Filter by status */}
        <StatusFilters
          label='Filter by Status'
          options={['Status', 'Pending', 'Approved', 'Declined']}
          selectedOption={statusFilter}
          onChange={handleStatusFilterChange}
        />
        {/* Filter by dates */}
        {showMoreFilters && (
          <DateFilters
            label='Filter by Date Range'
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        )}
        <button
          onClick={toggleMoreFilters}
          className='text-sm text-nezeza_dark_blue underline'
        >
          {showMoreFilters ? 'Less Filters' : 'More Filters'}
        </button>

        {/* Clear Filters Button */}
        <ClearFilters clearFiltersFunction={clearFilters} />
      </TableFilters>

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
            <Loading message='applications' />
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
                            checked={selectedRows.includes(application._id)}
                            onChange={() => handleSelectRow(application._id)}
                          />
                        ),
                      },
                      { content: application.status, isStatus: true },
                      { content: formatIdByShortening(application._id) },
                      { content: application.storeId.name },
                      { content: application.storeId.storeType },
                      {
                        content: `${application.primaryContactId.firstName} ${application.primaryContactId.lastName}`,
                      },
                      { content: formatDate(application.createdAt) },
                      { content: formatDate(application.updatedAt) },

                      {
                        content: (
                          <RowActionDropdown
                            actions={[
                              {
                                label: 'View',
                                onClick: () => handleUpdate(application), //TODO:Change
                              },
                              {
                                label: 'Approve',
                                onClick: () => handleUpdate(application), //TODO:Change
                              },
                              {
                                label: 'Decline',
                                onClick: () => handleUpdate(application), //TODO:Change
                              },
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
    </AdminLayout>
  );
};

StoreApplications.noLayout = true;
export default StoreApplications;

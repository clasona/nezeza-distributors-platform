import React, { useEffect, useState } from 'react';
import SellerProducts from '@/components/SellerProducts';
import AdminLayout from '.';
import PageHeader from '@/components/PageHeader';
import { getAllStoreApplications } from '../../utils/store/getAllStoreApplications';
import {
  UserProps,
  StoreApplicationProps,
  StoreProps,
  BillingInfoProps,
} from '../../../type';
import mockStoreApplications from './mock-data/mockStoreApplications';
import Button from '@/components/FormInputs/Button';
import { sortItems } from '../../utils/sortItems';
import TableFilters from '@/components/Table/TableFilters';
import BulkDeleteButton from '@/components/Table/BulkDeleteButton';
import StatusFilters from '@/components/Table/Filters/StatusFilters';
import DateFilters from '@/components/Table/Filters/DateFilters';
import SearchField from '@/components/Table/SearchField';
import ClearFilters from '@/components/Table/Filters/ClearFilters';
import TableHead from '@/components/Table/TableHead';
import TableRow from '@/components/Table/TableRow';
import { formatIdByShortening } from '../../utils/formatId';
import formatDate from '../../utils/formatDate';
import RowActionDropdown from '@/components/Table/RowActionDropdown';
import Pagination from '@/components/Table/Pagination';
import UpdateRowModal from '@/components/Table/UpdateRowModal';
import RemoveRowModal from '@/components/Table/DeleteRowModal';
import BulkDeleteModal from '@/components/Table/BulkDeleteModal';
import SuccessMessageModal from '@/components/SuccessMessageModal';

const StoreApplications = () => {
  const [storeApplications, setStoreApplications] = useState<
    StoreApplicationProps[]
  >([]);
  const [sampleApplications, setSampleApplications] = useState<
    StoreApplicationProps[]
  >([]);

  const [filteredApplications, setFilteredApplications] = useState<
    StoreApplicationProps[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

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
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  //for table row dropdown actions i.e: update, remove
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // const defaultStoreProps: StoreProps = {
  //   // Initialize all fields of StoreProps
  // };
  const [currentRowData, setCurrentRowData] = useState<StoreApplicationProps>({
    _id: 0,
    status: '',
    primaryContactId: {} as UserProps,
    storeId: {} as StoreProps,
    billingInfo: {} as BillingInfoProps,
    createdAt: '',
    updatedAt: '',
  });

  //setting my applications data
  const fetchData = async () => {
    try {
      //sample applications
      // const storeApplicationsData = mockStoreApplications;
      const storeApplicationsData = await getAllStoreApplications();
      setStoreApplications(storeApplicationsData);
      // setSampleApplications(sampleApplicationsData);
      setFilteredApplications(storeApplicationsData); // Initially show all applications
    } catch (error) {
      console.error('Error fetching store applications data:', error);
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
    // Update filteredApplications to reflect the updated row
    setFilteredApplications((prevApplications) =>
      prevApplications.map((application) =>
        application._id === updatedRow._id
          ? { ...application, ...updatedRow }
          : application
      )
    );
    setSuccessMessage(`Order # ${updatedRow._id} updated successfully.`);
    setIsUpdateModalOpen(false); // Close the modal after saving
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleRemove = (id: number) => {
    setFilteredApplications((prevApplications) =>
      prevApplications.filter((application) => application._id !== id)
    );
  };

  const handleRemoveClick = (rowData: StoreApplicationProps) => {
    setCurrentRowData(rowData); // Set the selected row data
    setIsRemoveModalOpen(true); // Open the modal
  };

  const handleConfirmRemove = (id: number) => {
    setFilteredApplications((prevApplications) =>
      prevApplications.filter((application) => application._id !== id)
    );

    setSuccessMessage(`Order # ${id} deleted successfully.`);
    //TODO: Remove from database
    setIsRemoveModalOpen(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  //for bulk deleting
  const handleSelectRow = (id: number) => {
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
      await Promise.all(
        selectedRows.map((id) => deleteStoreApplication(userInfo, id))
      );

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
        //   className='mt-0'
        heading='Store Applications'
        actions={
          <Button
            buttonTitle='Refresh'
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
        <DateFilters
          label='Filter by Date Range'
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />

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
                    { content: application.storeId.storeTypessa },
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
                              onClick: () => handleRemoveClick(application), //TODO:Change
                            },
                          ]}
                        />
                      ),
                    },
                  ]}
                  onUpdate={handleSaveUpdatedRow}
                  onRemove={handleRemove}
                />
              ))}
            ;
          </tbody>
        </table>
        <Pagination
          data={filteredApplications}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
        {/* Update Row Modal */}
        <UpdateRowModal
          isOpen={isUpdateModalOpen}
          rowData={currentRowData}
          onClose={handleCloseUpdateModal}
          onSave={handleSaveUpdatedRow}
        />
        {/* Remove Row Modal */}
        <RemoveRowModal
          isOpen={isRemoveModalOpen}
          rowData={currentRowData}
          onClose={() => setIsRemoveModalOpen(false)}
          onDelete={() => handleConfirmRemove(currentRowData._id)}
        />
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

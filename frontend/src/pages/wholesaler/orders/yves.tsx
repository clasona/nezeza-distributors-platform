import React, { useState, useEffect } from 'react';
import TableRow from './TableRow';
import RowActionDropdown from './RowActionDropdown';
import EditModal from './EditModal';

// Define your OrderProps type
interface OrderProps {
  _id: string;
  status: string;
  quantity: number;
  name: string;
}

const Inventory = () => {
  const [filteredOrders, setFilteredOrders] = useState<OrderProps[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRowData, setCurrentRowData] = useState<OrderProps | null>(null);

  // Fetching sample data or orders from an API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming mockCustomerOrders is your sample data
        const sampleOrdersData = mockCustomerOrders; // Use your data here
        setFilteredOrders(sampleOrdersData); // Initially set filtered orders
      } catch (error) {
        console.error('Error fetching existing customer orders data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = (rowData: OrderProps) => {
    setCurrentRowData(rowData); // Pass the row data to the modal for editing
    setIsModalOpen(true);
  };

  const handleRemove = (id: string) => {
    setFilteredOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== id)
    );
  };

  const handleSaveUpdatedRow = (updatedRow: OrderProps) => {
    // Update filteredOrders to reflect the updated row
    setFilteredOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedRow._id ? { ...order, ...updatedRow } : order
      )
    );
    setIsModalOpen(false); // Close the modal after saving
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal without saving
  };

  return (
    <div>
      <table className='table-auto w-full'>
        <thead>
          <tr>
            <th>Status</th>
            <th>Stock</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <TableRow
              key={order._id}
              rowData={order}
              rowValues={[
                { content: order.status, isStatus: true },
                { content: order.quantity, isStock: true },
                { content: order.name },
                {
                  content: (
                    <RowActionDropdown
                      actions={[
                        { label: 'Update', onClick: () => handleUpdate(order) },
                        {
                          label: 'Remove',
                          onClick: () => handleRemove(order._id),
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
        </tbody>
      </table>

      {/* Edit Modal */}
      {currentRowData && (
        <EditModal
          isOpen={isModalOpen}
          rowData={currentRowData}
          onClose={handleCloseModal}
          onSave={handleSaveUpdatedRow}
        />
      )}
    </div>
  );
};

export default Inventory;

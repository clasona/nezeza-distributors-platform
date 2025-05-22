import React, { useEffect, useState } from 'react';
import { ProductProps, OrderProps } from '../../../type';
import TextInput from '../FormInputs/TextInput';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

interface UpdateModalProps<T,> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onSave: (updatedData: T) => void;
}

const UpdateRowModal = <T,>({
  isOpen,
  rowData,
  onClose,
  onSave,
}: UpdateModalProps<T>) => {

    if (!isOpen) return null;


   if (!rowData) {
     return null; // Or a loading indicator, or a message
   }
   const {
     register,
     handleSubmit,
     formState: { errors },
     setValue,
   } = useForm();
  
  const [formData, setFormData] = useState<T>(rowData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State for confirmation dialog

  // Log formData whenever it changes to help with debugging
  useEffect(() => {
    console.log('Received rowData:', rowData);
    if (isOpen) {
      setFormData(rowData);
    }
  }, [isOpen, rowData]); // This effect runs whenever `isOpen` or `rowData` changes

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = () => {
    setShowConfirmDialog(true);
  };

  // Handle confirmation of save
  const handleConfirmSave = () => {
    onSave(formData);
    //TODO: Save in the db as well
    setShowConfirmDialog(false);
    onClose();
  };

  const handleCancelSave = () => {
    setShowConfirmDialog(false); // Close confirmation dialog without saving
  };
  //checks if the data is of type OrderProps by verifying the existence of the fulfillmentStatus field.
  const isOrderProps = (data: any): data is OrderProps =>
    'fulfillmentStatus' in data;

  //checks if the data is of type ProductProps by verifying the presence of quantity and price.
  const isProductProps = (data: any): data is ProductProps =>
    'quantity' in data && 'price' in data;

const [isConfirming, setIsConfirming] = useState(false); // Track confirmation state
  const router = useRouter();
    const [confirmationMessage, setConfirmationMessage] = useState<string>('');


   const handleConfirm = async () => {
     setIsConfirming(true); // Set confirming to true to disable the button

     if (isProductProps(formData)) {
        setConfirmationMessage(
          `⏳ Redirecting to update product page. Please wait...`
        );
        // Delay navigation to show confirmation message
        setTimeout(() => {
          router.push(
            {
              pathname: './inventory/update-product', // Just the pathname
              query: {
                _id: formData._id,
              },
            },
            '../inventory/update-product'
          );
        }, 2000);
     
     }
      
     setIsConfirming(false); // Reset confirming state
   };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-96'>
        {/* <form onSubmit={handleSubmit(onSubmit)}> */}
        {isOrderProps(formData) && (
          <>
            <h3 className='text-lg font-semibold mb-4'>Update Order</h3>
            <div className='mb-4'>
              <label className='block text-lg font-medium text-gray-700'>
                Order #:{' '}
                <span className=' px-2 text-lg font-bold text-nezeza_dark_blue'>
                  {formData._id}
                </span>
              </label>
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Status
              </label>
              <select
                name='fulfillmentStatus'
                value={formData.fulfillmentStatus}
                onChange={handleChange}
                className='mt-1 px-12 py-2 border border-gray-300 rounded-md w-full'
              >
                <option value=''>Select Status</option>
                <option value='Pending'>Pending</option>
                <option value='Fulfilled'>Fulfilled</option>
                <option value='Shipped'>Shipped</option>
                <option value='Delivered'>Delivered</option>
                <option value='Canceled'>Canceled</option>
              </select>
            </div>
          </>
        )}
        {isProductProps(formData) && (
          <>
            <h3 className='text-lg font-semibold mb-4'>
              Update Inventory Product
            </h3>
            <p className='mt-4'>
              Are you sure you want to update product with ID #:{' '}
              <span className='text-nezeza_dark_blue'>{formData._id}</span>
            </p>
          </>
        )}
        <div className='flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-nezeza_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={
              'px-4 py-2 text-white bg-nezeza_green_600 hover:bg-nezeza_green_800 rounded-md'
            }
          >
            Confirm
          </button>
        </div>
        {confirmationMessage && (
          <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded'>
            {confirmationMessage.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
        {/* </form> */}
      </div>
      {/* Confirmation Dialog */}
      {/* {showConfirmDialog && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-nezeza_light_blue p-6 rounded-lg shadow-lg w-96'>
            <h3 className='text-lg font-semibold mb-4'>Confirm Changes</h3>
            <p className='mb-4'>Are you sure you want to save the changes?</p>
            <div className='flex justify-end space-x-4'>
              <button
                onClick={handleCancelSave}
                className='px-4 py-2 text-nezeza_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className='px-4 py-2 text-white bg-nezeza_green_600 rounded-md'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default UpdateRowModal;

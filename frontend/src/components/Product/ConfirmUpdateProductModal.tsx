import { handleError } from '@/utils/errorUtils';
import { updateOrderItem } from '@/utils/order/updateOrderItem';
import { checkIfProductExists } from '@/utils/product/checkIfProductExists';
import { updateProductQuantity } from '@/utils/product/updateProductQuantity';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { OrderItemsProps, ProductProps } from '../../../type'; // Import OrderItemsProps
import ErrorMessageModal from '../ErrorMessageModal';
import DropdownInputSearchableAsync from '../FormInputs/DropdownInputSearchableAsync';

interface ConfirmUpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  item: OrderItemsProps;
  // href: string;
}

const ConfirmUpdateProductModal = ({
  isOpen,
  onClose,
  orderId,
  item,
}: ConfirmUpdateProductModalProps) => {
  if (!isOpen) {
    return null;
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
  } = useForm();

  const productId = useWatch({ control, name: 'productId' }); // Subscribe to productId changes
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmationMessage, setConfirmationMessage] = useState<string>(''); // Store confirmation message

  const [productExists, setProductExists] = useState<boolean | null>(null);
  const [isConfirming, setIsConfirming] = useState(false); // Track confirmation state
  const router = useRouter();

  const handleConfirm = async (updateType: string) => {
    setIsConfirming(true); // Set confirming to true to disable the button

    const productId = selectedProduct?.id;

    if (!productId) {
      setErrorMessage('Please select a product.');
      setIsConfirming(false);
      return; // Stop execution
    }
    try {
      const exists = await checkIfProductExists(productId);
      if (!item.addedToInventory) {
        if (updateType === 'quantity') {
          const productData: Partial<ProductProps> = {
            quantity: exists.quantity + item.quantity,
          };
          await updateProductQuantity(productId, productData);

          //update to addedToInventoty= true so ordered item cant be added/updated twice
          const orderItemData: Partial<OrderItemsProps> = {
            addedToInventory: true,
          };
          if (orderId && item._id) {
            await updateOrderItem(orderId, item._id, orderItemData);
          }
          setConfirmationMessage(
            `📝 Inventory Product Update Preview:\n\n` +
              `🔹 Current Quantity: ${exists.quantity}\n` +
              `🔹 Quantity to Add: ${item.quantity}\n` +
              `🔹 New Expected Quantity: ${
                exists.quantity + item.quantity
              }\n\n` +
              `✅  Product quantity updated successfully!`
          );
          setTimeout(() => onClose(), 4000);
        } else if (updateType === 'product') {
          setConfirmationMessage(
            `📝 Update Preview for ${selectedProduct.label}:\n\n` +
              `🔹 Current Quantity: ${exists.quantity}\n` +
              `🔹 Quantity to Add: ${item.quantity}\n` +
              `🔹 New Expected Quantity: ${
                exists.quantity + item.quantity
              }\n\n` +
              `⏳ Redirecting to update product page. Please wait...`
          ),
            setTimeout(() => {
              router.push(
                {
                  pathname: '../inventory/update-product', // Just the pathname
                  query: {
                    _id: productId,
                    quantity_to_add: item.quantity,
                    order_id: orderId,
                    order_item_id: item._id,
                  },
                },
                '../inventory/update-product'
              );
            }, 3000);
        }
      } else {
        console.log(productId);
        setConfirmationMessage(
          '⚠ The selected item has already been updated in your inventory.\n' +
            'An ordered item cannot be updated twice.'
        );
      }

      setIsConfirming(false); // Reset confirming state
    } catch (error: any) {
      handleError(error);
      setErrorMessage(error);
    }
  };

  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const handleProductSelectChange = (
    selectedOption: { id: string; label: string } | null
  ) => {
    setSelectedProduct(selectedOption);
    console.log('Selected product:', selectedOption);
  };

  // };
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-100'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Update Product</h3>
        <p className='mb-4'>Please select your inventory product to update</p>
        {/* <DropdownInputSearchable options={productOptions} /> */}
        <DropdownInputSearchableAsync
          label='Select Item'
          onChange={handleProductSelectChange}
        />
        <div className='flex justify-end space-x-4 mt-4'>
          <button
            onClick={() => handleConfirm('quantity')}
            disabled={isConfirming}
            className={
              'px-4 py-2 text-white bg-vesoko_green_600 hover:bg-vesoko_green_800 rounded-md'
            }
          >
            Update Quantity
          </button>
          <button
            onClick={() => handleConfirm('product')}
            disabled={isConfirming}
            className={
              'px-4 py-2 text-white bg-vesoko_green_600 hover:bg-vesoko_green_800 rounded-md'
            }
          >
            Update Product
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 text-vesoko_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
        </div>
        {/* Error Message */}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
        {/* Display Confirmation Message (optional) */}
        {confirmationMessage && (
          <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded'>
            {confirmationMessage.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmUpdateProductModal;

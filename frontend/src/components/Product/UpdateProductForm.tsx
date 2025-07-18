'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TextInput from '../FormInputs/TextInput';
import TextAreaInput from '../FormInputs/TextAreaInput';
import { useForm } from 'react-hook-form';
import { generateSlug } from '@/lib/generateSlug';
import SubmitButton from '../FormInputs/SubmitButton';
import SuccessMessageModal from '../SuccessMessageModal';
import ErrorMessageModal from '../ErrorMessageModal';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { OrderItemsProps, ProductProps, stateProps } from '../../../type';
import { updateProduct } from '@/utils/product/updateProduct';
import { getSingleProduct } from '@/utils/product/getSingleProduct';
import { updateOrderItem } from '@/utils/order/updateOrderItem';
import CloudinaryUploadWidget from '../Cloudinary/UploadWidget';
import DropdownInputSearchable from '../FormInputs/DropdownInputSearchable';

interface UpdateProductFormProps {
  onSubmitSuccess?: (data: any) => void;
}
const UpdateProductForm: React.FC<UpdateProductFormProps> = ({
  onSubmitSuccess,
}) => {
  const router = useRouter();
  const [productData, setProductData] = useState<ProductProps | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Must match with backend Product model
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'food', label: 'Food' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'others', label: 'Others' },
  ];
  const colorOptions = [
    '#222',
    '#000',
    '#fff',
    '#f00',
    '#0f0',
    '#00f',
    '#ff0',
    '#0ff',
    '#f0f',
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  useEffect(() => {
    const queryProductId = router.query._id;
    const queryQuantityToAdd = router.query.quantity_to_add;
    if (queryProductId) {
      setValue('productId', queryProductId);
      const fetchProductData = async () => {
        try {
          const data = await getSingleProduct(queryProductId);
          setProductData(data);

          if (data) {
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                try {
                  if (queryQuantityToAdd && key === 'quantity') {
                    setValue(key, data[key] + Number(queryQuantityToAdd));
                  } else {
                    setValue(key, data[key]);
                  }
                } catch (error) {
                  console.warn(`Error setting value for ${key}:`, error);
                }
              }
            }
            if (data.images && Array.isArray(data.images)) {
              setImageUrls(data.images);
            }
            if (data.colors && Array.isArray(data.colors)) {
              setSelectedColors(data.colors);
            }
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };

      fetchProductData();
    }
  }, [router.query, setValue]);

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleRemoveImage = useCallback(
    (idx: number) => {
      setImageUrls((prev) => prev.filter((_, i) => i !== idx));
      if (selectedImgIdx === idx) {
        setSelectedImgIdx(0);
      } else if (selectedImgIdx > idx) {
        setSelectedImgIdx((prev) => prev - 1);
      }
    },
    [selectedImgIdx]
  );

  const onSubmit = async (data: any) => {
    const slug = generateSlug(data.title);
    data.slug = slug;

    if (!imageUrls.length) {
      setErrorMessage('Please upload at least one product image.');
      return;
    }
    if (!selectedColors.length) {
      setErrorMessage('Please select at least one color.');
      return;
    }

    const numericFields = [
      'weight',
      'height',
      'width',
      'length',
      'quantity',
      'price',
      'taxRate',
    ];
    for (const field of numericFields) {
      if (!data[field] && data[field] !== 0) {
        setErrorMessage(`Please provide a value for ${field}.`);
        return;
      }
    }

    const productData: Partial<ProductProps> = {
      ...data,
      images: imageUrls,
      colors: selectedColors,
      storeId: storeInfo?._id,
      featured: !!data.featured,
      freeShipping: !!data.freeShipping,
      availability: !!data.availability,
    };

    try {
      const response = await updateProduct(data.productId, productData);

      const orderItemData: Partial<OrderItemsProps> = {
        addedToInventory: true,
      };
      if (router.query.order_id && router.query.order_item_id) {
        await updateOrderItem(
          String(router.query.order_id),
          String(router.query.order_item_id),
          orderItemData
        );
      }
      setErrorMessage('');
      setSuccessMessage('Product updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      setErrorMessage('Error updating product.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full max-w-4xl p-4 bg-vesoko_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-2'
    >
      <TextInput
        label='Product ID'
        id='productId'
        name='productId'
        register={register}
        errors={errors}
        disabled
        type='text'
      />
      <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
        <TextInput
          label='Product Title'
          id='title'
          name='title'
          register={register}
          errors={errors}
          type='text'
        />
        <DropdownInputSearchable
          label='Category'
          id='category'
          name='category'
          options={categoryOptions}
          register={register}
          errors={errors}
          value={
            productData?.category
              ? {
                  label: productData?.category,
                  value: productData?.category,
                }
              : {
                  label: '',
                  value: '',
                }
          }
        />
        <TextAreaInput
          label='Product Description'
          id='description'
          name='description'
          register={register}
          errors={errors}
          className='sm:col-span-2'
        />
        <TextInput
          label='Quantity'
          id='quantity'
          name='quantity'
          register={register}
          errors={errors}
          type='number'
        />
        <TextInput
          label='Unit Price'
          id='price'
          name='price'
          register={register}
          errors={errors}
          type='number'
        />

        {/* Images */}
        <div className='col-span-2 mt-3 flex flex-wrap gap-2'>
          <label className='block font-medium mb-1'>
            Product Images <span className='text-vesoko_red_600'> *</span>
          </label>
          {imageUrls.map((url, i) => (
            <div key={i} className='relative'>
              <img
                src={url}
                alt={`Product Image ${i + 1}`}
                className='w-16 h-16 object-cover rounded border'
              />
              <button
                type='button'
                className='absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs shadow'
                onClick={() => handleRemoveImage(i)}
                aria-label='Remove image'
              >
                &times;
              </button>
            </div>
          ))}
          <CloudinaryUploadWidget
            onUpload={(urls) => setImageUrls((prev) => [...prev, ...urls])}
          >
            <button
              type='button'
              className='w-16 h-16 flex items-center justify-center rounded border cursor-pointer bg-gray-50 hover:bg-gray-200 text-vizpac-main-orange'
            >
              +
            </button>
          </CloudinaryUploadWidget>
        </div>

        {/* Colors */}
        <div className='col-span-2 flex flex-wrap items-center gap-2 mt-2'>
          <label className='block font-medium mb-1'>
            Select Colors <span className='text-vesoko_red_600'>*</span>
          </label>
          {colorOptions.map((color) => (
            <button
              type='button'
              key={color}
              className={`w-7 h-7 rounded-full border-2 flex-shrink-0 mr-1 ${
                selectedColors.includes(color)
                  ? 'border-vesoko_green_600 ring-2 ring-vesoko_green_600'
                  : 'border-gray-300'
              }`}
              style={{ background: color }}
              onClick={() => handleColorChange(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        {/* Boolean fields */}
        <div className='flex items-center gap-2 mt-2'>
          <input
            id='featured'
            type='checkbox'
            {...register('featured')}
            className='form-checkbox accent-vesoko_green_600'
          />
          <label htmlFor='featured' className='font-medium'>
            Featured
          </label>
        </div>
        <div className='flex items-center gap-2 mt-2'>
          <input
            id='freeShipping'
            type='checkbox'
            {...register('freeShipping')}
            className='form-checkbox accent-vesoko_green_600'
          />
          <label htmlFor='freeShipping' className='font-medium'>
            Free Shipping
          </label>
        </div>
        <div className='flex items-center gap-2 mt-2'>
          <input
            id='availability'
            type='checkbox'
            {...register('availability')}
            className='form-checkbox accent-vesoko_green_600'
            defaultChecked
          />
          <label htmlFor='availability' className='font-medium'>
            Available for Sale
          </label>
        </div>
        {/* Physical dimensions */}
        <TextInput
          label='Weight (lbs)'
          id='weight'
          name='weight'
          register={register}
          errors={errors}
          type='number'
        />
        <TextInput
          label='Height (inches)'
          id='height'
          name='height'
          register={register}
          errors={errors}
          type='number'
        />
        <TextInput
          label='Width (inches)'
          id='width'
          name='width'
          register={register}
          errors={errors}
          type='number'
        />
        <TextInput
          label='Length (inches)'
          id='length'
          name='length'
          register={register}
          errors={errors}
          type='number'
        />
        {/* Tax rate */}
        <TextInput
          label='Tax Rate (%)'
          id='taxRate'
          name='taxRate'
          register={register}
          errors={errors}
          type='number'
        />
      </div>
      <div className='flex items-center justify-center'>
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
        <SubmitButton
          isLoading={false}
          buttonTitle='Update Product'
          loadingButtonTitle='Updating inventory product...'
        />
      </div>
    </form>
  );
};

export default UpdateProductForm;

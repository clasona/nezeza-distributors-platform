'use client';

import React, { useState } from 'react';
import TextInput from './FormInputs/TextInput';
import TextAreaInput from './FormInputs/TextAreaInput';
import { useForm } from 'react-hook-form';
import { generateSlug } from '@/lib/generateSlug';
import ImageInput from './FormInputs/ImageInput';
import MultiImageInput from './FormInputs/MultipleImageInput';
import Button from './FormInputs/Button';
import { CldUploadWidget } from 'next-cloudinary';
import CloudinaryImageUpload from './FormInputs/CloudinaryImageUpload';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { stateProps } from '../../type';
import { createProduct } from '@/pages/utils/product/createProduct';
import DropdownInput from './FormInputs/DropdownInput';
import SubmitButton from './FormInputs/SubmitButton';
import SuccessMessageModal from './SuccessMessageModal';
import ErrorMessageModal from './ErrorMessageModal';

interface NewProductFormProps {
  onSubmitSuccess?: (data: any) => void; // Callback after successful submission
}
const NewProductForm: React.FC<NewProductFormProps> = ({ onSubmitSuccess }) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mainImageResource, setMainImageResource] = useState<any>(null);

  //must match with what's defined in backedn Product model
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'food', label: 'Food' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'others', label: 'Others' },
  ];
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  const onSubmit = async (data: any) => {
    const slug = generateSlug(data.title);
    data.slug = slug;

    // Ensure mainImageResource exists before submitting
    if (!mainImageResource) {
      setErrorMessage('Please upload a main image before submitting.');
      alert('Please upload a main product image before submitting');
      return; // Prevent form submission
    }

    // Prepare image URLs (main image and additional images)
    const productData = {
      ...data,
      // imageUrl, // Main product image URL
      image: mainImageResource?.secure_url, // Main product image URL
      // createdAt: new Date().toISOString(),
      // updatedAt: new Date().toISOString(),
      owner: storeInfo._id,
      buyerStoreId: storeInfo._id,
      sellerStoreId: storeInfo._id,
      productId: storeInfo._id,
      // additionalImages: additionalImages.map((file) =>
      //   URL.createObjectURL(file)
      // ), // Placeholder URLs for additional images
    };

    try {
      const response = await createProduct(userInfo, productData);
      setErrorMessage('');
      setSuccessMessage('Product created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);

      // TODO: Reset form inputs
      setMainImageResource(null);

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data); // Call the callback with the response data
      }
    } catch (error) {
      setErrorMessage('Error creating product.');
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='w-full max-w-4xl p-4 bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-2'
    >
      <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
        {/* 
        title, price,  description, image, category, colors, featured,
        weight, height, freeshipping, availability, stock, avergaerating, 
        numOfReviews, storeId */}
        <TextInput
          label='Product Title'
          id='title'
          name='title'
          register={register}
          errors={errors}
          type='text'
        />
        <DropdownInput
          label='Category'
          id='category'
          name='category'
          options={categoryOptions}
          register={register}
          errors={errors}
        />
        <TextAreaInput
          label='Product Description'
          id='description'
          name='description'
          register={register}
          errors={errors}
          className='sm:col-span-2' //span full row
        />
        <TextInput
          label='Stock'
          id='stock'
          name='stock'
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

        {/* Main product image */}
        <CloudinaryImageUpload
          label='Main Product Image'
          className='sm:col-span-2' //span full row
          onResourceChange={setMainImageResource} // Set mainImageResource on upload success
        />
        {/* upload more product images  */}
        <div className='col-span-2'>
          <label className='mb-2 font-medium text-gray-700'>
            Additional Product Images
          </label>
          <MultiImageInput onFilesChange={setAdditionalImages} />
        </div>
      </div>
      <div className='flex items-center justify-center'>
        {/* <Button
          isLoading={false}
          buttonTitle='Create Product'
          loadingButtonTitle='Creating product...'
          icon={Plus}
          className='px-5 py-2.5 mt-4 sm:mt-6 text-white bg-nezeza_green_600 hover:bg-green-700 focus:ring-4 focus:ring-green-200 '
          disabled={!mainImageResource} // Disable button if no main image
          type='submit'
        /> */}
        {successMessage && (
          <SuccessMessageModal successMessage={successMessage} />
        )}
        {errorMessage && (
          <ErrorMessageModal errorMessage={errorMessage} />
        )}
        {/* {errorMessage && <p className='text-red-600'>{errorMessage}</p>} */}
        <SubmitButton
          isLoading={false}
          buttonTitle='Create Product'
          loadingButtonTitle='Creating inventory product...'
        />
      </div>
    </form>
  );
};

export default NewProductForm;

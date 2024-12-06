'use client';

import React from 'react';
import WholesalerLayout from '../index';
import { X } from 'lucide-react';
import FormHeader from '@/components/FormHeader';
import TextInput from '@/components/FormInputs/TextInput';
import { useForm } from 'react-hook-form';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextAreaInput from '@/components/FormInputs/TextAreaInput';
import { generateSlug } from '@/lib/generateSlug';

const NewInventory = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data: any) {
    const slug = generateSlug(data.title);
    data.slug = slug;
    console.log(data);
  }

  return (
    <WholesalerLayout>
      <FormHeader title='Create New Product' />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-4xl p-4 bg-nezeza_light_blue border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mx-auto my-3 '
      >
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'>
          <div className='flex flex-col'>
            <TextInput
              label='Product Title'
              name='title'
              register={register}
              errors={errors}
              type='text'
            />
          </div>
          <div className='flex flex-col'>
            <TextInput
              label='Product ID'
              name='productId'
              register={register}
              errors={errors}
              type='text'
            />
          </div>

          <TextAreaInput
            label='Product Description'
            name='description'
            register={register}
            errors={errors}
          />
          <div className='flex flex-col'>
            <TextInput
              label='Buyer Store ID' //TODO: we might not need this cause should be own store
              name='buyerStoreId'
              register={register}
              errors={errors}
              type='text'
            />
          </div>
          <div className='flex flex-col'>
            <TextInput
              label='Seller Store ID' //TODO: we might not need this cause should be own store
              name='sellerStoreId'
              register={register}
              errors={errors}
              type='text'
            />
          </div>
          <div className='flex flex-col'>
            <TextInput
              label='Stock'
              name='stock'
              register={register}
              errors={errors}
              type='number'
            />
          </div>
          <div className='flex flex-col'>
            <TextInput
              label='Unit Price'
              name='price'
              register={register}
              errors={errors}
              type='number'
            />
          </div>
        </div>
        <p className='mt-4'>(Product Image goes here)</p>
        <div className='flex items-center justify-center'>
          <SubmitButton
            isLoading={false}
            buttonTitle='Create Product'
            loadingButtonTitle='Creating inventory product...'
          />
        </div>
      </form>
    </WholesalerLayout>
  );
};

NewInventory.noLayout = true;
export default NewInventory;

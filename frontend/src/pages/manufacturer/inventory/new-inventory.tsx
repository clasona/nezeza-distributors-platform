'use client';

import React, { useState } from 'react';
import WholesalerLayout from '../../index';
import { X } from 'lucide-react';
import FormHeader from '@/components/FormHeader';
import TextInput from '@/components/FormInputs/TextInput';
import { useForm } from 'react-hook-form';
import Button from '@/components/FormInputs/Button';
import TextAreaInput from '@/components/FormInputs/TextAreaInput';
import { generateSlug } from '@/lib/generateSlug';
import FileInput from '@/components/FormInputs/ImageInput';
import MultiImageInput from '@/components/FormInputs/MultipleImageInput';
import ImageInput from '@/components/FormInputs/ImageInput-Old';
import NewProductForm from '@/components/NewProductForm';
import ManufacturerLayout from '..';

const NewInventory = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
    // alert('Product created successfully!');
  };

  return (
    <ManufacturerLayout>
      <FormHeader title='Create New Product' />
      <NewProductForm onSubmitSuccess={handleFormSubmit} />
    </ManufacturerLayout>
  );
};

NewInventory.noLayout = true;
export default NewInventory;

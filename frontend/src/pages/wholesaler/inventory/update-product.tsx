'use client';

import React, { useState } from 'react';
import WholesalerLayout from '../layout';
import FormHeader from '@/components/FormHeader';
import UpdateProductForm from '@/components/Product/UpdateProductForm';


const UpdateProduct = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
  };

  return (
    <WholesalerLayout>
      <FormHeader title='Update Product' />
      <UpdateProductForm onSubmitSuccess={handleFormSubmit} />
    </WholesalerLayout>
  );
};

UpdateProduct.noLayout = true;
export default UpdateProduct;

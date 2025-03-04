'use client';

import FormHeader from '@/components/FormHeader';
import UpdateProductForm from '@/components/Product/UpdateProductForm';
import RetailerLayout from '../layout';


const UpdateProduct = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
  };

  return (
    <RetailerLayout>
      <FormHeader title='Update Product' />
      <UpdateProductForm onSubmitSuccess={handleFormSubmit} />
    </RetailerLayout>
  );
};

UpdateProduct.noLayout = true;
export default UpdateProduct;

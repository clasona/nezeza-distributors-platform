'use client';

import FormHeader from '@/components/FormHeader';
import NewProductForm from '@/components/Product/NewProductForm';
import RetailerLayout from '../layout';

const NewProduct = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
  };

  return (
    <RetailerLayout>
      <FormHeader title='Create New Product' />
      <NewProductForm onSubmitSuccess={handleFormSubmit} />
    </RetailerLayout>
  );
};

NewProduct.noLayout = true;
export default NewProduct;

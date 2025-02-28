'use client';

import FormHeader from '@/components/FormHeader';
import NewProductForm from '@/components/Product/NewProductForm';
import WholesalerLayout from '../layout';

const NewProduct = () => {
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
  };

  return (
    <WholesalerLayout>
      <FormHeader title='Create New Product' />
      <NewProductForm onSubmitSuccess={handleFormSubmit} />
    </WholesalerLayout>
  );
};

NewProduct.noLayout = true;
export default NewProduct;

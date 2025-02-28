'use client';

import FormHeader from '@/components/FormHeader';
import NewProductForm from '@/components/Product/NewProductForm';
import ManufacturerLayout from '../layout';

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

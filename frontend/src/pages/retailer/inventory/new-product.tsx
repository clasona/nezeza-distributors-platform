'use client';

import NewProductForm from '@/components/Product/NewProductForm';
import RetailerLayout from '../layout';
import { ArrowLeft, Package, Plus } from 'lucide-react';
import { useRouter } from 'next/router';

const NewProduct = () => {
  const router = useRouter();
  
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
    // Navigate back to inventory after successful creation
    router.push('/retailer/inventory');
  };

  return (
    <RetailerLayout>
      <div className='space-y-6'>
        {/* Modern Header */}
        <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-white/20'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.back()}
                className='flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200'
              >
                <ArrowLeft className='w-5 h-5 text-gray-600' />
              </button>
              
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-vesoko_primary to-vesoko_primary_dark flex items-center justify-center'>
                  <Plus className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Create New Product</h1>
                  <p className='text-sm text-gray-600'>Add a new product to your inventory</p>
                </div>
              </div>
            </div>
            
            <div className='hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vesoko_background to-emerald-50 border border-vesoko_background rounded-lg'>
              <Package className='w-4 h-4 text-vesoko_primary' />
              <span className='text-sm font-medium text-vesoko_green_700'>New Product</span>
            </div>
          </div>
        </div>
        
        {/* Form Container */}
        <NewProductForm onSubmitSuccess={handleFormSubmit} />
      </div>
    </RetailerLayout>
  );
};

NewProduct.noLayout = true;
export default NewProduct;

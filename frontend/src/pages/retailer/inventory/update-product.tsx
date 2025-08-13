'use client';

import UpdateProductForm from '@/components/Product/UpdateProductForm';
import RetailerLayout from '../layout';
import { ArrowLeft, Package, Edit3 } from 'lucide-react';
import { useRouter } from 'next/router';

const UpdateProduct = () => {
  const router = useRouter();
  
  const handleFormSubmit = (data: any) => {
    console.log('Product form submitted successfully:', data);
    // Navigate back to inventory after successful update
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
                <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center'>
                  <Edit3 className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Update Product</h1>
                  <p className='text-sm text-gray-600'>Edit your product information and details</p>
                </div>
              </div>
            </div>
            
            <div className='hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg'>
              <Package className='w-4 h-4 text-orange-600' />
              <span className='text-sm font-medium text-orange-700'>Edit Product</span>
            </div>
          </div>
        </div>
        
        {/* Form Container */}
        <UpdateProductForm onSubmitSuccess={handleFormSubmit} />
      </div>
    </RetailerLayout>
  );
};

UpdateProduct.noLayout = true;
export default UpdateProduct;

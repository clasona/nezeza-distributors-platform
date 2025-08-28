import Products from '@/components/Products';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Mail,
  MapPin,
  Phone,
  Store as StoreIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProductProps, StoreProps, stateProps } from '../../../type';
import { getStore } from '../../utils/store/getStore';
import { getStoreProducts } from '../../utils/store/getStoreProducts';

const StoreProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  const [store, setStore] = useState<StoreProps | null>(null);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchStoreData = async () => {
        try {
          setLoading(true);
          // Fetch store info and products in parallel
          const [storeData, productsData] = await Promise.all([
            getStore(id as string),
            getStoreProducts(id as string)
          ]);
          
          setStore(storeData);
          setProducts(productsData);
        } catch (error) {
          console.error('Error fetching store data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchStoreData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-vesoko_primary'></div>
        <span className='ml-2 text-lg'>Loading store...</span>
      </div>
    );
  }

  if (!store) {
    return (
      <div className='max-w-6xl mx-auto px-2 md:px-6 py-6'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-800'>Store Not Found</h1>
          <p className='text-gray-600 mt-2'>The store you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push('/')}
            className='mt-4 bg-vesoko_primary text-white hover:bg-vesoko_primary_dark'
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-2 md:px-6 py-6'>
      <button
        className='px-4 py-1 bg-gray-300 text-vesoko_gray_600 rounded-md hover:bg-gray-400 mb-6'
        onClick={() => router.back()}
      >
        <ChevronLeft className='inline mr-1' size={16} />
        Back
      </button>

      {/* Store Header */}
      <div className='bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8'>
        <div className='flex flex-col md:flex-row gap-6 items-start'>
          {/* Store Logo */}
          <div className='flex-shrink-0'>
            <div className='w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden'>
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={`${store.name} logo`}
                  width={160}
                  height={160}
                  className='w-full h-full object-cover'
                />
              ) : (
                <StoreIcon size={60} className='text-gray-400' />
              )}
            </div>
          </div>

          {/* Store Information */}
          <div className='flex-1 min-w-0'>
            <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
              <div className='flex-1'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
                  {store.name || store.storeName}
                </h1>
                
                {store.category && (
                  <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-vesoko_background text-vesoko_secondary mb-3'>
                    <StoreIcon size={16} className='mr-1' />
                    {store.category}
                  </div>
                )}

                {store.description && (
                  <p className='text-gray-600 text-base leading-relaxed mb-4'>
                    {store.description}
                  </p>
                )}

                {/* Contact Information */}
                <div className='space-y-2'>
                  {/* {store.email && (
                    <div className='flex items-center text-gray-600'>
                      <Mail size={16} className='mr-2 text-vesoko_primary' />
                      <span>{store.email}</span>
                    </div>
                  )} */}
                  
                  {store.phone && (
                    <div className='flex items-center text-gray-600'>
                      <Phone size={16} className='mr-2 text-vesoko_primary' />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  
                  {/* {store.address && (
                    <div className='flex items-start text-gray-600'>
                      <MapPin size={16} className='mr-2 mt-0.5 text-vesoko_primary flex-shrink-0' />
                      <span>
                        {store.address.street1}
                        {store.address.street2 && `, ${store.address.street2}`}
                        <br />
                        {store.address.city}, {store.address.state} {store.address.zip}
                        <br />
                        {store.address.country}
                      </span>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Store Stats */}
              <div className='flex flex-col items-center md:items-end text-center md:text-right'>
                <div className='bg-vesoko_background px-4 py-2 rounded-lg'>
                  <p className='text-sm text-vesoko_secondary'>Store Type</p>
                  <p className='font-semibold text-vesoko_secondary capitalize'>
                    {store.storeType}
                  </p>
                </div>
                
                <div className='mt-4 text-sm text-gray-500'>
                  {products.length} Product{products.length !== 1 ? 's' : ''} Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className='mb-6'>
        <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-2'>
          Products from {store.name}
        </h2>
        <div className='h-1 w-20 bg-vesoko_primary rounded'></div>
      </div>
      
      {/* Use the existing Products component */}
      <Products products={products} isLoading={loading} />
    </div>
  );
};

export default StoreProfile;

'use client';

import { generateSlug } from '@/lib/generateSlug';
import { updateOrderItem } from '@/utils/order/updateOrderItem';
import { createProduct } from '@/utils/product/createProduct';
import { getSingleProduct } from '@/utils/product/getSingleProduct';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { OrderItemsProps, ProductProps, stateProps } from '../../../type';
import ErrorMessageModal from '../ErrorMessageModal';
import DropdownInput from '../FormInputs/DropdownInput';
import SubmitButton from '../FormInputs/SubmitButton';
import TextAreaInput from '../FormInputs/TextAreaInput';
import TextInput from '../FormInputs/TextInput';
import TagsInput from '../FormInputs/TagsInput';
import SuccessMessageModal from '../SuccessMessageModal';
import CloudinaryUploadWidget, { CloudinaryFileInfo } from '../Cloudinary/UploadWidget';
import { 
  Package, 
  DollarSign, 
  Camera, 
  Plus, 
  Check, 
  Ruler,
  Settings,
  X
} from 'lucide-react';

interface NewProductFormProps {
  onSubmitSuccess?: (data: any) => void;
}
const NewProductForm: React.FC<NewProductFormProps> = ({ onSubmitSuccess }) => {
  const router = useRouter();
  const [productData, setProductData] = useState<ProductProps | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  //must match with what's defined in backedn Product model
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'food', label: 'Food' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'others', label: 'Others' },
  ];

  const colorOptions = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green  
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#808080', // Gray
    '#000080', // Navy
    '#008000', // Dark Green
    '#800000', // Maroon
  ];
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  useEffect(() => {
    const queryProductId = router.query._id;

    if (queryProductId) {
      const fetchProductData = async () => {
        try {
          const data = await getSingleProduct(queryProductId);
          setProductData(data);

          if (data) {
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                try {
                  if (key === 'quantity') {
                    setValue(key, router.query.quantity);
                  } else {
                    setValue(key, data[key]);
                  }
                } catch (error) {
                  console.warn(`Error setting value for ${key}:`, error);
                }
              }
            }
            if (data.images && Array.isArray(data.images)) {
              setImageUrls(data.images);
            }
            if (data.tags && Array.isArray(data.tags)) {
              setTags(data.tags);
            }
            if (data.colors && Array.isArray(data.colors)) {
              setSelectedColors(data.colors);
            }
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      };

      fetchProductData();
    }
  }, [router.query, setValue]);

  // Color selection state for multi input
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('#000000');
  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };
  
  const handleAddCustomColor = () => {
    if (customColor && !selectedColors.includes(customColor)) {
      setSelectedColors((prev) => [...prev, customColor]);
    }
  };
  
  const handleRemoveColor = (colorToRemove: string) => {
    setSelectedColors((prev) => prev.filter((c) => c !== colorToRemove));
  };

  const handleRemoveImage = useCallback(
    (idx: number) => {
      setImageUrls((prev) => prev.filter((_, i) => i !== idx));
      if (selectedImgIdx === idx) {
        setSelectedImgIdx(0);
      } else if (selectedImgIdx > idx) {
        setSelectedImgIdx((prev) => prev - 1);
      }
    },
    [selectedImgIdx]
  );

  const onSubmit = async (data: any) => {
    const slug = generateSlug(data.title);
    data.slug = slug;

    // Required images validation
    if (!imageUrls.length) {
      setErrorMessage('Please upload at least one product image.');
      return;
    }

    // Colors are now optional - no validation needed
    // Required numeric fields validation
    const numericFields = [
      'weight',
      'height',
      'width',
      'length',
      'quantity',
      'price',
      'taxRate',
    ];
    for (const field of numericFields) {
      if (!data[field] && data[field] !== 0) {
        setErrorMessage(`Please provide a value for ${field}.`);
        return;
      }
    }
    // Prepare image URLs (main image and additional images)
    const productData: Partial<ProductProps> = {
      ...data,
      images: imageUrls,
      colors: selectedColors,
      tags: tags,
      storeId: storeInfo?._id,
      featured: !!data.featured,
      freeShipping: !!data.freeShipping,
      availability: !!data.availability,
    };

    try {
      const response = await createProduct(productData);
      //update to addedToInventoty= true so ordered item cant be added/updated twice
      const orderItemData: Partial<OrderItemsProps> = {
        addedToInventory: true,
      };
      if (router.query.order_id && router.query.order_item_id) {
        await updateOrderItem(
          String(router.query.order_id),
          String(router.query.order_item_id),
          orderItemData
        );
      }
      setErrorMessage('');
      setSuccessMessage('Product created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);

      setImageUrls([]);
      setSelectedColors([]);
      setTags([]);
      setCustomColor('#000000');

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      setErrorMessage('Error creating product.');
    }
  };

  return (
    <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='p-6 sm:p-8'
      >
        {/* Product Information Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-vesoko_primary500 to-vesoko_primary_dark flex items-center justify-center'>
              <Package className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Product Information</h2>
              <p className='text-sm text-gray-600'>Basic details about your product</p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <TextInput
          label='Product Title'
          id='title'
          name='title'
          register={register}
          errors={errors}
          type='text'
        />
        <DropdownInput
          label='Category'
          id='category'
          name='category'
          options={categoryOptions}
          register={register}
          errors={errors}
        />
            <TextAreaInput
              label='Product Description'
              id='description'
              name='description'
              register={register}
              errors={errors}
              className='sm:col-span-2' //span full row
            />
            
            {/* Tags Input */}
            <div className='sm:col-span-2'>
              <TagsInput
                label='Product Tags'
                tags={tags}
                onChange={setTags}
                placeholder='Add tags to help customers find your product...'
                maxTags={15}
              />
            </div>
          </div>
        </div>
        {/* Pricing & Inventory Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center'>
              <DollarSign className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Pricing & Inventory</h2>
              <p className='text-sm text-gray-600'>Set your pricing and stock levels</p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <TextInput
              label='Quantity'
              id='quantity'
              name='quantity'
              register={register}
              errors={errors}
              type='number'
            />
            <TextInput
              label='Unit Price'
              id='price'
              name='price'
              register={register}
              errors={errors}
              type='number'
            />
            
            {/* Tax rate */}
            <TextInput
              label='Tax Rate (%)'
              id='taxRate'
              name='taxRate'
              register={register}
              errors={errors}
              type='number'
            />
            
            {/* Availability checkbox */}
            <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <input
                id='availability'
                type='checkbox'
                {...register('availability')}
                className='w-5 h-5 text-vesoko_primary bg-gray-100 border-gray-300 rounded focus:ring-vesoko_primary focus:ring-2'
                defaultChecked
              />
              <label htmlFor='availability' className='text-sm font-medium text-gray-900'>
                Available for Sale
              </label>
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center'>
              <Camera className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Product Media</h2>
              <p className='text-sm text-gray-600'>Upload images and select colors</p>
            </div>
          </div>
          
          {/* Images */}
          <div className='mb-6'>
            <label className='block text-sm font-semibold text-gray-900 mb-4'>
              Product Images <span className='text-red-500'>*</span>
            </label>
            
            <div className='grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4'>
              {imageUrls.map((url, i) => (
                <div key={i} className='relative group'>
                  <Image
                    src={url}
                    alt={`Product Image ${i + 1}`}
                    width={80}
                    height={80}
                    className='w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200'
                  />
                  <button
                    type='button'
                    className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg transition-colors duration-200'
                    onClick={() => handleRemoveImage(i)}
                    aria-label='Remove image'
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <CloudinaryUploadWidget
                onUpload={(files) => setImageUrls((prev) => [...prev, ...files.map(f => f.secure_url || f.url)])}
              >
                <button
                  type='button'
                  className='w-full h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-vesoko_primary bg-gray-50 hover:bg-vesoko_background transition-colors duration-200 group'
                >
                  <Plus className='w-6 h-6 text-gray-400 group-hover:text-vesoko_green_500 mb-1' />
                  <span className='text-xs text-gray-500 group-hover:text-vesoko_primary'>Add Image</span>
                </button>
              </CloudinaryUploadWidget>
            </div>
            
            {imageUrls.length === 0 && (
              <p className='text-sm text-gray-500 mt-2'>Upload at least one product image to showcase your product.</p>
            )}
          </div>
          {/* Colors */}
          <div className='mb-6'>
            <label className='block text-sm font-semibold text-gray-900 mb-4'>
              Available Colors <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            
            {/* Preset Colors */}
            <div className='mb-4'>
              <p className='text-sm text-gray-600 mb-3'>Choose from preset colors:</p>
              <div className='flex flex-wrap gap-3'>
                {colorOptions.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  const isLight = ['#FFFFFF', '#FFFF00', '#00FFFF', '#FFC0CB'].includes(color);
                  
                  return (
                    <button
                      type='button'
                      key={color}
                      className={`w-10 h-10 rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 relative ${
                        isSelected
                          ? 'border-vesoko_green_500 ring-2 ring-vesoko_green_500/30 scale-105'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ background: color }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Select color ${color}`}
                      title={color}
                    >
                      {isSelected && (
                        <Check className={`w-5 h-5 drop-shadow-sm ${
                          isLight ? 'text-gray-800' : 'text-white'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Custom Color Picker */}
            <div className='mb-4'>
              <p className='text-sm text-gray-600 mb-3'>Or add a custom color:</p>
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <input
                    type='color'
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className='w-12 h-10 rounded-lg border border-gray-300 cursor-pointer'
                    title='Pick a custom color'
                  />
                  <input
                    type='text'
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder='#000000'
                    className='px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono w-24 focus:outline-none focus:ring-2 focus:ring-vesoko_primary focus:border-vesoko_primary'
                  />
                </div>
                <button
                  type='button'
                  onClick={handleAddCustomColor}
                  disabled={!customColor || selectedColors.includes(customColor)}
                  className='px-4 py-2 bg-vesoko_primary hover:bg-vesoko_primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors duration-200'
                >
                  Add Color
                </button>
              </div>
            </div>
            
            {/* Selected Colors */}
            {selectedColors.length > 0 && (
              <div>
                <p className='text-sm text-gray-600 mb-3'>Selected colors ({selectedColors.length}):</p>
                <div className='flex flex-wrap gap-2'>
                  {selectedColors.map((color) => {
                    const isLight = ['#FFFFFF', '#FFFF00', '#00FFFF', '#FFC0CB'].includes(color);
                    return (
                      <div
                        key={color}
                        className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50'
                      >
                        <div
                          className='w-5 h-5 rounded border border-gray-300'
                          style={{ background: color }}
                        ></div>
                        <span className='text-xs font-mono text-gray-700'>{color}</span>
                        <button
                          type='button'
                          onClick={() => handleRemoveColor(color)}
                          className='text-gray-400 hover:text-red-500 transition-colors duration-200'
                          aria-label={`Remove color ${color}`}
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {selectedColors.length === 0 && (
              <p className='text-sm text-gray-500 mt-2'>No colors selected. You can add colors to help customers choose variants.</p>
            )}
          </div>
        </div>
        {/* Physical Dimensions Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center'>
              <Ruler className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Product Dimensions</h2>
              <p className='text-sm text-gray-600'>Physical measurements for shipping calculations</p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <TextInput
              label='Weight (lbs)'
              id='weight'
              name='weight'
              register={register}
              errors={errors}
              type='number'
            />
            <TextInput
              label='Height (inches)'
              id='height'
              name='height'
              register={register}
              errors={errors}
              type='number'
            />
            <TextInput
              label='Width (inches)'
              id='width'
              name='width'
              register={register}
              errors={errors}
              type='number'
            />
            <TextInput
              label='Length (inches)'
              id='length'
              name='length'
              register={register}
              errors={errors}
              type='number'
            />
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center'>
              <Settings className='w-5 h-5 text-white' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Additional Settings</h2>
              <p className='text-sm text-gray-600'>Extra product configuration options</p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {/* TODO: PREMIUM FEATURE */}
            {/* <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <input
                id='featured'
                type='checkbox'
                {...register('featured')}
                className='w-5 h-5 text-vesoko_primary bg-gray-100 border-gray-300 rounded focus:ring-vesoko_primary focus:ring-2'
              />
              <label htmlFor='featured' className='text-sm font-medium text-gray-900'>
                Featured Product
              </label>
            </div> */}
            
            <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <input
                id='freeShipping'
                type='checkbox'
                {...register('freeShipping')}
                className='w-5 h-5 text-vesoko_primary bg-gray-100 border-gray-300 rounded focus:ring-vesoko_primary focus:ring-2'
              />
              <label htmlFor='freeShipping' className='text-sm font-medium text-gray-900'>
                Free Shipping
              </label>
            </div>
          </div>
        </div>
        
        {/* Submit Section */}
        <div className='border-t border-gray-200 pt-6'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-600'>
              <span className='text-red-500'>*</span> Required fields
            </div>
            
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={() => router.back()}
                className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200'
              >
                Cancel
              </button>
              
              <SubmitButton
                isLoading={false}
                buttonTitle='Create Product'
                loadingButtonTitle='Creating Product...'
                className='px-8 py-3 bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark hover:from-vesoko_primary_2 hover:to-vesoko_secondary text-white rounded-lg font-medium transition-all duration-200 shadow-lg'
              />
            </div>
          </div>
        </div>
      </form>
      
      {/* Modals */}
      {successMessage && (
        <SuccessMessageModal successMessage={successMessage} />
      )}
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default NewProductForm;

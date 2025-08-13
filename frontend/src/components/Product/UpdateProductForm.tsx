'use client';

import React, { useEffect, useState, useCallback } from 'react';
import TextInput from '../FormInputs/TextInput';
import TextAreaInput from '../FormInputs/TextAreaInput';
import { useForm } from 'react-hook-form';
import { generateSlug } from '@/lib/generateSlug';
import SubmitButton from '../FormInputs/SubmitButton';
import SuccessMessageModal from '../SuccessMessageModal';
import ErrorMessageModal from '../ErrorMessageModal';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { OrderItemsProps, ProductProps, stateProps } from '../../../type';
import { updateProduct } from '@/utils/product/updateProduct';
import { getSingleProduct } from '@/utils/product/getSingleProduct';
import { updateOrderItem } from '@/utils/order/updateOrderItem';
import CloudinaryUploadWidget from '../Cloudinary/UploadWidget';
import DropdownInputSearchable from '../FormInputs/DropdownInputSearchable';
import { ArrowLeft, Package, DollarSign, Image, Ruler, Settings, Palette, Check } from 'lucide-react';

interface UpdateProductFormProps {
  onSubmitSuccess?: (data: any) => void;
}
const UpdateProductForm: React.FC<UpdateProductFormProps> = ({
  onSubmitSuccess,
}) => {
  const router = useRouter();
  const [productData, setProductData] = useState<ProductProps | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Must match with backend Product model
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    { value: 'food', label: 'Food' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'others', label: 'Others' },
  ];
  const presetColors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#DC2626' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Green', value: '#059669' },
    { name: 'Yellow', value: '#D97706' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Pink', value: '#DB2777' },
    { name: 'Gray', value: '#6B7280' },
  ];

  const [customColor, setCustomColor] = useState('');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  useEffect(() => {
    const queryProductId = router.query._id;
    const queryQuantityToAdd = router.query.quantity_to_add;
    if (queryProductId) {
      setValue('productId', queryProductId);
      const fetchProductData = async () => {
        try {
          const data = await getSingleProduct(queryProductId);
          setProductData(data);

          if (data) {
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                try {
                  if (queryQuantityToAdd && key === 'quantity') {
                    setValue(key, data[key] + Number(queryQuantityToAdd));
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

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
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

    if (!imageUrls.length) {
      setErrorMessage('Please upload at least one product image.');
      return;
    }
    if (!selectedColors.length) {
      setErrorMessage('Please select at least one color.');
      return;
    }

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

    const productData: Partial<ProductProps> = {
      ...data,
      images: imageUrls,
      colors: selectedColors,
      storeId: storeInfo?._id,
      featured: !!data.featured,
      freeShipping: !!data.freeShipping,
      availability: !!data.availability,
    };

    try {
      const response = await updateProduct(data.productId, productData);

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
      setSuccessMessage('Product updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }
    } catch (error) {
      setErrorMessage('Error updating product.');
    }
  };

  const addCustomColor = () => {
    if (customColor && !selectedColors.includes(customColor)) {
      setSelectedColors(prev => [...prev, customColor]);
      setCustomColor('');
      setIsColorPickerOpen(false);
    }
  };

  const removeColor = (colorToRemove: string) => {
    setSelectedColors(prev => prev.filter(color => color !== colorToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Update Product</h1>
            <p className="text-gray-600 mt-1">Modify your product details and inventory</p>
          </div>
        </div>
        
        {/* Status indicator */}
        {productData && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                productData.availability ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium">
                {productData.availability ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hidden Product ID */}
        <input type="hidden" {...register('productId')} />
        
        {/* Product Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
                <p className="text-sm text-gray-600">Basic details about your product</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Product Title"
                id="title"
                name="title"
                register={register}
                errors={errors}
                type="text"
                className="col-span-1"
              />
              <DropdownInputSearchable
                label="Category"
                id="category"
                name="category"
                options={categoryOptions}
                register={register}
                errors={errors}
                value={
                  productData?.category
                    ? {
                        label: productData?.category,
                        value: productData?.category,
                      }
                    : {
                        label: '',
                        value: '',
                      }
                }
              />
              <div className="md:col-span-2">
                <TextAreaInput
                  label="Product Description"
                  id="description"
                  name="description"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h2>
                <p className="text-sm text-gray-600">Set your pricing and track inventory</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Unit Price ($)"
                id="price"
                name="price"
                register={register}
                errors={errors}
                type="number"
                step="0.01"
              />
              <TextInput
                label="Quantity in Stock"
                id="quantity"
                name="quantity"
                register={register}
                errors={errors}
                type="number"
              />
              <TextInput
                label="Tax Rate (%)"
                id="taxRate"
                name="taxRate"
                register={register}
                errors={errors}
                type="number"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Media</h2>
                <p className="text-sm text-gray-600">Upload images to showcase your product</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Product Images <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <CloudinaryUploadWidget
                  onUpload={(urls) => setImageUrls((prev) => [...prev, ...urls])}
                >
                  <div className="w-full h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className="text-center">
                      <svg className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-500" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-gray-500 group-hover:text-blue-500 mt-1">Add Image</span>
                    </div>
                  </div>
                </CloudinaryUploadWidget>
              </div>
              {imageUrls.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Please upload at least one product image</p>
              )}
            </div>
          </div>
        </div>

        {/* Color Options Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Color Options</h2>
                <p className="text-sm text-gray-600">Choose available colors for your product</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Available Colors <span className="text-red-500">*</span>
              </label>
              
              {/* Preset Colors */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Preset Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleColorChange(color.value)}
                      className={`relative group flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                        selectedColors.includes(color.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-sm border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs text-gray-600 mt-1">{color.name}</span>
                      {selectedColors.includes(color.value) && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Color Picker */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Custom Color</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#000000"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomColor}
                    disabled={!customColor || selectedColors.includes(customColor)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Color
                  </button>
                </div>
              </div>
              
              {/* Selected Colors */}
              {selectedColors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Selected Colors ({selectedColors.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((color) => (
                      <div key={color} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700">{color}</span>
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedColors.length === 0 && (
                <p className="text-sm text-red-500">Please select at least one color</p>
              )}
            </div>
          </div>
        </div>

        {/* Product Dimensions Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Ruler className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Dimensions</h2>
                <p className="text-sm text-gray-600">Physical specifications for shipping calculations</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TextInput
                label="Weight (lbs)"
                id="weight"
                name="weight"
                register={register}
                errors={errors}
                type="number"
                step="0.01"
              />
              <TextInput
                label="Length (inches)"
                id="length"
                name="length"
                register={register}
                errors={errors}
                type="number"
                step="0.01"
              />
              <TextInput
                label="Width (inches)"
                id="width"
                name="width"
                register={register}
                errors={errors}
                type="number"
                step="0.01"
              />
              <TextInput
                label="Height (inches)"
                id="height"
                name="height"
                register={register}
                errors={errors}
                type="number"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Additional Settings</h2>
                <p className="text-sm text-gray-600">Configure product visibility and shipping options</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* TODO: PREMIUM FEATURE */}
              {/* <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Featured Product</h3>
                  <p className="text-sm text-gray-600">Show this product prominently on your store</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div> */}
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Free Shipping</h3>
                  <p className="text-sm text-gray-600">Offer free shipping for this product</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('freeShipping')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Available for Sale</h3>
                  <p className="text-sm text-gray-600">Make this product available for customers to purchase</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('availability')}
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>Ready to update your product? Review all sections before submitting.</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <SubmitButton
                  isLoading={false}
                  buttonTitle="Update Product"
                  loadingButtonTitle="Updating Product..."
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Success/Error Modals */}
      {successMessage && <SuccessMessageModal successMessage={successMessage} />}
      {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
    </div>
  );
};

export default UpdateProductForm;

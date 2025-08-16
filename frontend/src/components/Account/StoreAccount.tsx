import React, { useEffect, useState, useCallback, useMemo } from 'react';
import TextInput from '@/components/FormInputs/TextInput';
import { useForm } from 'react-hook-form';
import defaultStoreImage from '@/images/defaultUserImage.png';
import Image from 'next/image';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import ErrorMessageModal from '@/components/ErrorMessageModal';
import UploadWidget, { CloudinaryFileInfo } from '../Cloudinary/UploadWidget';
import PageHeader from '../PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { stateProps } from '../../../type';
import { addStore } from '@/redux/nextSlice';
import { getStore } from '@/utils/store/getStore';
import { updateStore } from '@/utils/store/updateStore';
import FullScreenLoader from '@/components/Loaders/FullScreenLoader';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';

const StoreAccount = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // getValues,
  } = useForm();

  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [isSaving, setSaving] = useState<boolean>(false);
  const [currentStoreData, setCurrentStoreData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<{ value: string; label: string } | null>(null);
  const dispatch = useDispatch();

  // Handle logo upload
  const handleLogoUpload = async (files: CloudinaryFileInfo[]) => {
    if (files.length > 0 && storeInfo?._id) {
      const logoUrl = files[0].secure_url || files[0].url; // Take the first uploaded image URL
      
      try {
        // Immediately update the logo in the database
        await updateStore(storeInfo._id, { logo: logoUrl });
        
        // Update local states
        setStoreLogo(logoUrl);
        setValue('logo', logoUrl);
        
        // Update current store data
        setCurrentStoreData((prev: any) => ({ ...prev, logo: logoUrl }));
        
        // Update Redux state
        const updatedStoreInfo = { ...storeInfo, logo: logoUrl };
        dispatch(addStore(updatedStoreInfo));
        
        setSuccessMessage('Logo uploaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error uploading logo:', error);
        setErrorMessage('Failed to upload logo. Please try again.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  // Handle logo removal
  const handleLogoRemove = async () => {
    if (!storeInfo?._id) return;
    
    try {
      // Immediately update the logo in the database (set to empty string or null)
      await updateStore(storeInfo._id, { logo: '' });
      
      // Update local states
      setStoreLogo(null);
      setValue('logo', '');
      
      // Update current store data
      setCurrentStoreData((prev: any) => ({ ...prev, logo: '' }));
      
      // Update Redux state
      const updatedStoreInfo = { ...storeInfo, logo: '' };
      dispatch(addStore(updatedStoreInfo));
      
      setSuccessMessage('Logo removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing logo:', error);
      setErrorMessage('Failed to remove logo. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );

  // Store category options
  const storeCategoryOptions = useMemo(() => [
    { value: 'food', label: 'Food & Beverage' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'services', label: 'Professional Services' },
    { value: 'other', label: 'Other' },
  ], []);

  const fetchStoreData = useCallback(async () => {
    if (!storeInfo?._id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const storeData = await getStore(storeInfo._id);
      setCurrentStoreData(storeData);
      
      // Set form values with store data
      if (storeData) {
        setValue('name', storeData.name || '');
        setValue('description', storeData.description || '');
        setValue('category', storeData.category || '');
        setValue('email', storeData.email || '');
        setValue('phone', storeData.phone || '');
        setValue('registrationNumber', storeData.registrationNumber || '');
        setValue('storeType', storeData.storeType || '');
        
        // Set selected category for dropdown
        if (storeData.category) {
          const categoryOption = storeCategoryOptions.find(option => option.value === storeData.category);
          setSelectedCategory(categoryOption || null);
        }
        
        // Address fields
        setValue('street1', storeData.address?.street1 || storeData.address?.street || '');
        setValue('street2', storeData.address?.street2 || '');
        setValue('city', storeData.address?.city || '');
        setValue('state', storeData.address?.state || '');
        setValue('zip', storeData.address?.zip || '');
        setValue('country', storeData.address?.country || '');
        setValue('addressPhone', storeData.address?.phone || storeData.phone || '');
      }
    } catch (error) {
      console.error('Failed to fetch store data', error);
      setErrorMessage('Failed to load store data');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  }, [storeInfo?._id, setValue, storeCategoryOptions]);

  useEffect(() => {
    fetchStoreData();
  }, [storeInfo?._id, fetchStoreData]);

  const onSubmit = async (data: any) => {
    if (!storeInfo?._id) {
      setErrorMessage('Store ID not found');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    setSaving(true);
    const updatedFields: any = {};

    // Extract address fields and group them
    const addressFields = {
      street1: data.street1,
      street2: data.street2,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      phone: data.addressPhone,
    };

    // Remove address fields from main data and create structured data
    const { street1: _street1, street2: _street2, city: _city, state: _state, zip: _zip, country: _country, addressPhone: _addressPhone, ...otherData } = data;
    
    const newStoreData = {
      ...otherData,
      logo: storeLogo || currentStoreData?.logo,
      address: addressFields,
    };

    // Compare current form values with the current store data and find changes
    Object.keys(newStoreData).forEach((key) => {
      if (key === 'address') {
        // Special handling for address object
        const currentAddress = currentStoreData?.address || {};
        const newAddress = newStoreData.address;
        
        // Check if any address field has changed
        const addressChanged = Object.keys(newAddress).some(
          (addressKey) => newAddress[addressKey] !== (currentAddress[addressKey] || '')
        );
        
        if (addressChanged) {
          updatedFields.address = newAddress;
        }
      } else if (newStoreData[key] && newStoreData[key] !== currentStoreData[key]) {
        updatedFields[key] = newStoreData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      setErrorMessage('No changes were made.');
      setTimeout(() => setErrorMessage(''), 4000);
      setSaving(false);
      return;
    }

    console.log('Sending updatedFields to backend:', updatedFields);

    try {
      const _updatedStore = await updateStore(storeInfo._id, updatedFields);
      
      // Update Redux state with new store data
      const updatedStoreInfo = {
        ...storeInfo,
        ...updatedFields,
      };
      dispatch(addStore(updatedStoreInfo));
      
      // Update local state as well
      setCurrentStoreData((prev: any) => ({ ...prev, ...updatedFields }));
      
      setErrorMessage('');
      setSuccessMessage('Store information updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error updating store data:', error);
      setErrorMessage('Error updating store information.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (!userInfo || !storeInfo) {
    return (
      <div>
        <PageHeader heading="Store Account" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Store Information Available</h3>
            <p className="text-gray-600">Please complete your store application to manage store settings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader heading="Store Account" />
        <FullScreenLoader />
      </div>
    );
  }

  return (
    <div>
      <PageHeader heading="Store Account" />
      <div className="mt-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-4xl p-6 bg-white border border-gray-200 rounded-lg shadow sm:p-8 md:p-10 mx-auto my-4"
        >
          {/* Store Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg">
                <Image
                  src={storeLogo || currentStoreData?.logo || defaultStoreImage}
                  alt="Store Logo"
                  width={128} 
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {(storeLogo || currentStoreData?.logo) ? 'Update or remove logo' : 'Upload store logo'}
              </div>
            </div>
            {/* Action buttons below logo */}
            {(storeLogo || currentStoreData?.logo) && (
              <div className="flex space-x-2 mt-3">
                {/* Update Logo Button */}
                <UploadWidget
                  onUpload={handleLogoUpload}
                  maxFiles={1}
                  folder="store-logos"
                >
                  <div className="w-10 h-10 bg-vesoko_primary hover:bg-vesoko_primary_dark rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 group/update">
                    <svg className="w-4 h-4 text-white group-hover/update:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </UploadWidget>
                {/* Remove Logo Button */}
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group/delete"
                >
                  <svg className="w-4 h-4 text-white group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
            {/* Upload Logo Button overlay for placeholder */}
            {!(storeLogo || currentStoreData?.logo) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <UploadWidget
                  onUpload={handleLogoUpload}
                  maxFiles={1}
                  folder="store-logos"
                >
                  <div className="w-16 h-16 bg-vesoko_primary hover:bg-vesoko_primary_dark rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 group/upload">
                    <svg className="w-6 h-6 text-white group-hover/upload:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </UploadWidget>
              </div>
            )}
            <p className="text-sm text-gray-600 font-medium mt-3">
              Store Logo
            </p>
          </div>

          {/* Store Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Store Information</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <TextInput
                label="Store Name"
                id="name"
                name="name"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
              <TextInput
                label="Store Type"
                id="storeType"
                name="storeType"
                register={register}
                errors={errors}
                type="text"
                disabled={true}
                isRequired={false}
              />
              <DropdownInputSearchable
                label="Category"
                name="category"
                options={storeCategoryOptions}
                value={selectedCategory}
                onChange={(selectedOption) => {
                  setSelectedCategory(selectedOption);
                  setValue('category', selectedOption?.value || '');
                }}
                placeholder="Select a category"
                isRequired={true}
                register={register}
                errors={errors}
              />
              <TextInput
                label="Registration Number"
                id="registrationNumber"
                name="registrationNumber"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
            </div>
            
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                {...register('description', { required: 'Store description is required' })}
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-vesoko_primary focus:border-vesoko_primary"
                placeholder="Describe your store, products, and what makes you unique..."
              />
              {typeof errors.description?.message === 'string' && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <TextInput
                label="Store Email"
                id="email"
                name="email"
                register={register}
                errors={errors}
                type="email"
                isRequired={true}
              />
              <TextInput
                label="Store Phone"
                id="phone"
                name="phone"
                register={register}
                errors={errors}
                type="tel"
                isRequired={true}
              />
            </div>
          </div>

          {/* Store Address Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Store Address</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <TextInput
                label="Street Address 1"
                id="street1"
                name="street1"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
              <TextInput
                label="Street Address 2 (Optional)"
                id="street2"
                name="street2"
                register={register}
                errors={errors}
                type="text"
                isRequired={false}
              />
              <TextInput
                label="City"
                id="city"
                name="city"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
              <TextInput
                label="State/Province"
                id="state"
                name="state"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
              <TextInput
                label="ZIP/Postal Code"
                id="zip"
                name="zip"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
              <TextInput
                label="Country"
                id="country"
                name="country"
                register={register}
                errors={errors}
                type="text"
                isRequired={true}
              />
              <TextInput
                label="Address Phone"
                id="addressPhone"
                name="addressPhone"
                register={register}
                errors={errors}
                type="tel"
                isRequired={false}
              />
            </div>
          </div>

          {/* Store Status Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Store Status</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current Status:</span>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  currentStoreData?.isActive 
                    ? 'bg-vesoko_green_100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentStoreData?.isActive ? 'Active' : 'Pending Approval'}
                </span>
              </div>
              {!currentStoreData?.isActive && (
                <p className="mt-2 text-sm text-gray-600">
                  Your store is pending admin approval. You&apos;ll be notified once it&apos;s activated.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-4">
            {successMessage && (<SuccessMessageModal successMessage={successMessage} />)}
            {errorMessage && <ErrorMessageModal errorMessage={errorMessage} />}
            <SubmitButton
              isLoading={isSaving}
              buttonTitle="Save Store Changes"
              loadingButtonTitle="Saving..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreAccount;

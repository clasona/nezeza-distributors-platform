import Link from 'next/link';
import { useState } from 'react';
import { Factory, Package, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle, Info, MapPin, Clock } from 'lucide-react';
import { useRouter } from 'next/router';

const SelectStoreType = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const router = useRouter();

  const storeTypes = [
    {
      value: 'manufacturing',
      title: 'Manufacturing',
      icon: Factory,
      description: 'Create and produce your own products',
      features: [
        'Direct from manufacturer pricing',
        'Custom product creation',
        'Bulk order capabilities',
        'Quality control management'
      ],
      badge: 'Coming Soon',
      disabled: true
    },
    {
      value: 'wholesale',
      title: 'Wholesale',
      icon: Package,
      description: 'Sell in bulk to businesses and retailers',
      features: [
        'Volume-based pricing',
        'B2B order management',
        'Inventory tracking',
        'Trade discount programs'
      ],
      badge: 'Coming Soon',
      disabled: true
    },
    {
      value: 'retail',
      title: 'Retail',
      icon: ShoppingBag,
      description: 'Direct-to-consumer sales',
      features: [
        'Individual product sales',
        'Customer-friendly interface',
        'Marketing tools',
        'Customer support tools'
      ],
      badge: 'Best for Early Adopters'
    }
  ];

  const handleContinue = () => {
    if (selectedType) {
      localStorage.setItem('selectedStoreType', selectedType);
      router.push('/store-application');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link 
            href='/sellers'
            className='inline-flex items-center gap-2 text-vesoko_dark_blue hover:text-vesoko_green_600 font-medium mb-8 transition-colors duration-200'
          >
            <ArrowLeft className='h-5 w-5' />
            Back to Overview
          </Link>
          
          <div className='inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <Info className='h-4 w-4' />
            Step 1 of 4 - Choose Your Store Type
          </div>
          
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            What Type of Store
            <span className='block text-vesoko_green_600'>Would You Like to Create?</span>
          </h1>
          
          <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            Choose the store type that best describes your business model. 
            This helps us customize your selling experience and provide the right tools for your success.
          </p>
        </div>

        {/* Phase Information */}
        <div className='mb-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200'>
          <div className='grid md:grid-cols-2 gap-8'>
            <div className='flex items-start gap-4'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full text-white font-bold text-lg'>
                1
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Phase 1: US-Based African Sellers</h3>
                <p className='text-gray-600 text-sm'>
                  Currently available for African sellers already operating in the US. 
                  Perfect for wholesalers and retailers with existing inventory.
                </p>
                <div className='inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-2'>
                  <CheckCircle className='h-3 w-3' />
                  Available Now
                </div>
              </div>
            </div>
            
            <div className='flex items-start gap-4'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full text-white font-bold text-lg'>
                2
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Phase 2: Direct from Africa</h3>
                <p className='text-gray-600 text-sm'>
                  For African manufacturers based in Africa. We're building logistics 
                  and compliance infrastructure to support direct exports.
                </p>
                <div className='inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium mt-2'>
                  <Clock className='h-3 w-3' />
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Type Cards */}
        <div className='grid md:grid-cols-3 gap-8 mb-12'>
          {storeTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = selectedType === type.value;
            
            return (
              <div
                key={type.value}
                onClick={() => !type.disabled && setSelectedType(type.value)}
                className={`relative group rounded-2xl border-2 p-8 transition-all duration-300 ${
                  type.disabled
                    ? 'cursor-not-allowed opacity-60 bg-gray-50 border-gray-300'
                    : isSelected 
                      ? 'cursor-pointer border-vesoko_green_500 bg-vesoko_green_50 shadow-xl shadow-vesoko_green_500/20 transform hover:scale-105' 
                      : 'cursor-pointer border-gray-200 bg-white hover:border-vesoko_green_300 hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {/* Badge */}
                <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold ${
                    type.disabled
                      ? 'bg-gray-500 text-white'
                      : type.value === 'retail' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-blue-500 text-white'
                  }`}>
                    {type.badge}
                  </span>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className='absolute top-4 right-4'>
                    <CheckCircle className='h-6 w-6 text-vesoko_green_500' />
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-colors duration-300 ${
                  isSelected 
                    ? 'bg-vesoko_green_500 text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-vesoko_green_100 group-hover:text-vesoko_green_600'
                }`}>
                  <IconComponent className='h-8 w-8' />
                </div>

                {/* Content */}
                <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                  isSelected ? 'text-vesoko_green_600' : 'text-gray-900'
                }`}>
                  {type.title}
                </h3>
                
                <p className='text-gray-600 mb-6 leading-relaxed'>
                  {type.description}
                </p>

                {/* Features */}
                <ul className='space-y-2'>
                  {type.features.map((feature, index) => (
                    <li key={index} className='flex items-center gap-2 text-sm text-gray-600'>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-vesoko_green_500' : 'bg-gray-400'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className='text-center'>
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedType
                ? 'bg-vesoko_green_600 hover:bg-vesoko_green_700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {selectedType ? 'Continue Application' : 'Select a Store Type'}
            {selectedType && (
              <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
            )}
          </button>
          
          {selectedType && (
            <p className='text-sm text-gray-600 mt-4'>
              You  won't be able to change this later, so choose wisely!
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className='mt-16 max-w-md mx-auto'>
          <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
            <span>Progress</span>
            <span>25%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div className='bg-vesoko_green_500 h-2 rounded-full transition-all duration-500' style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

SelectStoreType.noLayout = true;
export default SelectStoreType;

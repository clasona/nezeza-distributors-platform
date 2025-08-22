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
    <div className='min-h-screen bg-gradient-to-br from-vesoko_background_light via-white to-vesoko_primary/10 relative overflow-hidden'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-vesoko_primary/5 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-vesoko_secondary/5 rounded-full blur-3xl'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-vesoko_primary/3 to-vesoko_secondary/3 rounded-full blur-3xl'></div>
      </div>
      
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link 
            href='/sellers'
            className='inline-flex items-center gap-2 text-vesoko_primary hover:text-vesoko_primary font-medium mb-8 transition-colors duration-200'
          >
            <ArrowLeft className='h-5 w-5' />
            Back to Overview
          </Link>
          
          <div className='inline-flex items-center gap-2 bg-vesoko_background text-vesoko_secondary px-4 py-2 rounded-full text-sm font-medium mb-6'>
            <Info className='h-4 w-4' />
            Step 1 of 4 - Choose Your Store Type
          </div>
          
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            What Type of Store
            <span className='block text-vesoko_primary'>Would You Like to Create?</span>
          </h1>
          
          <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            Choose the store type that best describes your business model. 
            This helps us customize your selling experience and provide the right tools for your success.
          </p>
        </div>

        {/* Phase Information */}
        <div className='mb-12 bg-gradient-to-r from-vesoko_background to-vesoko_background_light rounded-2xl p-8 border border-vesoko_primary/20 shadow-lg backdrop-blur-sm relative overflow-hidden'>
          {/* Subtle pattern overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-vesoko_primary/5 to-transparent rounded-2xl'></div>
          <div className='grid md:grid-cols-2 gap-8'>
            <div className='flex items-start gap-4'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-vesoko_primary rounded-full text-white font-bold text-lg'>
                1
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>Phase 1: US-Based African Sellers</h3>
                <p className='text-gray-600 text-sm'>
                  Currently available for African sellers already operating in the US. 
                  Perfect for wholesalers and retailers with existing inventory.
                </p>
                <div className='inline-flex items-center gap-1 bg-vesoko_green_100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-2'>
                  <CheckCircle className='h-3 w-3' />
                  Available Now
                </div>
              </div>
            </div>
            
            <div className='flex items-start gap-4'>
              <div className='inline-flex items-center justify-center w-12 h-12 bg-vesoko_secondary rounded-full text-white font-bold text-lg'>
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
                className={`relative group rounded-2xl border-2 p-8 transition-all duration-300 backdrop-blur-sm ${
                  type.disabled
                    ? 'cursor-not-allowed opacity-60 bg-gray-50/90 border-gray-300'
                    : isSelected 
                      ? 'cursor-pointer border-vesoko_green_500 bg-gradient-to-br from-vesoko_green_50/80 to-white/90 shadow-2xl shadow-vesoko_green_500/20 transform hover:scale-105 ring-2 ring-vesoko_green_500/20' 
                      : 'cursor-pointer border-gray-200/50 bg-white/80 hover:border-vesoko_primary hover:bg-white/90 hover:shadow-2xl hover:shadow-vesoko_primary/10 transform hover:scale-105'
                }`}
              >
                {/* Background gradient overlay for non-disabled cards */}
                {!type.disabled && (
                  <div className='absolute inset-0 bg-gradient-to-br from-vesoko_primary/2 to-vesoko_secondary/2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                )}
                {/* Badge */}
                <div className='absolute -top-3 left-1/2 transform -translate-x-1/2 z-10'>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    type.disabled
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      : type.value === 'retail' 
                        ? 'bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark text-white' 
                        : 'bg-gradient-to-r from-vesoko_secondary to-vesoko_secondary_light text-white'
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
                    ? 'bg-vesoko_primary text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-vesoko_green_100 group-hover:text-vesoko_primary'
                }`}>
                  <IconComponent className='h-8 w-8' />
                </div>

                {/* Content */}
                <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                  isSelected ? 'text-vesoko_primary' : 'text-gray-900'
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
                        isSelected ? 'bg-vesoko_primary' : 'bg-gray-400'
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
            className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 overflow-hidden ${
              selectedType
                ? 'bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark hover:from-vesoko_primary_dark hover:to-vesoko_primary text-white shadow-xl hover:shadow-2xl transform hover:scale-105 ring-2 ring-vesoko_primary/20'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {/* Shimmer effect for active button */}
            {selectedType && (
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out'></div>
            )}
            <span className='relative z-10'>{selectedType ? 'Continue Application' : 'Select a Store Type'}</span>
            {selectedType && (
              <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10' />
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
          <div className='flex items-center justify-between text-sm text-gray-600 mb-3'>
            <span className='font-medium'>Progress</span>
            <span className='font-semibold text-vesoko_primary'>25%</span>
          </div>
          <div className='relative w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 shadow-inner'>
            <div 
              className='bg-gradient-to-r from-vesoko_primary to-vesoko_primary_dark h-3 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden'
              style={{ width: '25%' }}
            >
              {/* Shimmer effect */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse'></div>
              {/* Glow effect */}
              <div className='absolute inset-0 bg-vesoko_primary rounded-full blur-sm opacity-40'></div>
            </div>
          </div>
          <div className='text-center mt-3'>
            <span className='text-xs text-gray-500'>Step 1 of 4 completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

SelectStoreType.noLayout = true;
export default SelectStoreType;

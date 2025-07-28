import { getSellerTypeBaseurl } from '@/lib/utils';
import { ChevronDown, Menu, Star, Tag, Truck, Clock, SquareArrowOutUpRight, X, Utensils } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';

interface HeaderBottomProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  onCategorySelect?: (category: string) => void;
  onFilterSelect?: (filter: string) => void;
}

const HeaderBottom = ({ 
  showSidebar, 
  setShowSidebar, 
  onCategorySelect,
  onFilterSelect 
}: HeaderBottomProps) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const router = useRouter();
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);
  
  // Get current category from URL
  const currentCategory = router.query.category as string || 'all';
  const currentFilter = router.query.filter as string || '';

  // Categories from your product form
  const categories = [
    { value: 'all', label: 'All Categories', icon: Menu },
    { value: 'food', label: 'Food & Beverages', icon: Utensils },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'clothing', label: 'Clothing & Fashion', icon: '👕' },
    { value: 'furniture', label: 'Furniture & Home', icon: '🪑' },
    { value: 'others', label: 'Others', icon: '📦' },
  ];

  const quickFilters = [
    { 
      key: 'deals', 
      label: "Today's Deals", 
      icon: Tag,
      action: () => handleFilterClick('deals')
    },
    { 
      key: 'featured', 
      label: 'Featured', 
      icon: Star,
      action: () => handleFilterClick('featured')
    },
    { 
      key: 'free_shipping', 
      label: 'Free Shipping', 
      icon: Truck,
      action: () => handleFilterClick('free_shipping')
    },
    { 
      key: 'new_releases', 
      label: 'New Releases', 
      icon: Clock,
      action: () => handleFilterClick('new_releases')
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
      if (mobileFiltersRef.current && !mobileFiltersRef.current.contains(event.target as Node)) {
        setShowMobileFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to products section
  const scrollToProducts = () => {
    setTimeout(() => {
      const productsTop = document.querySelector('.products-top');
      if (productsTop) {
        window.scrollTo({
          top: (productsTop as HTMLElement).offsetTop - 100, // Add some offset for header
          behavior: 'smooth',
        });
      }
    }, 100); // Small delay to ensure content is loaded
  };

  const handleCategoryClick = (category: string) => {
    setShowCategoriesDropdown(false);
    
    // Navigate to home page with category filter
    const query = category === 'all' ? {} : { category };
    router.push({
      pathname: '/',
      query
    });
    
    // Scroll to products
    scrollToProducts();
    
    // Call callback if provided (for parent components)
    onCategorySelect?.(category);
  };

  const handleFilterClick = (filter: string) => {
    // Navigate to home page with filter
    router.push({
      pathname: '/',
      query: { filter }
    });
    
    // Scroll to products
    scrollToProducts();
    
    // Call callback if provided
    onFilterSelect?.(filter);
  };

  const handleCustomerServiceClick = () => {
    if (userInfo) {
      router.push('/customer/support');
    } else {
      router.push('/login?redirect=/customer/support');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    router.push({
      pathname: '/',
      query: {} // Clear all query parameters
    });
    
    // Scroll to products
    scrollToProducts();
    
    // Call callbacks
    onCategorySelect?.('all');
    onFilterSelect?.('');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return currentCategory !== 'all' || currentFilter !== '' || router.query.search;
  };

  // Get current category display text
  const getCurrentCategoryLabel = () => {
    const category = categories.find(cat => cat.value === currentCategory);
    return category ? category.label : 'All Categories';
  };

  return (
    <div className='w-full bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 shadow-sm backdrop-blur-sm sticky top-16 sm:top-20 z-40'>
      <div className='max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3'>
        <div className='flex items-center justify-between'>
          {/* Left side - Categories and Filters */}
          <div className='flex items-center gap-1 sm:gap-3 flex-1'>
            {/* Clear Filters - Mobile Optimized */}
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className='group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 min-h-[36px] touch-manipulation'
                title='Clear all filters'
              >
                <X className='w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300' />
                <span className='hidden xs:inline'>Clear</span>
                <span className='hidden sm:inline'>Filters</span>
              </button>
            )}
            
            {/* Categories Dropdown - Mobile Optimized */}
            <div className='relative flex-1 sm:flex-none' ref={dropdownRef}>
              <button
                onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                className='group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-vesoko_green_50 border border-gray-300 hover:border-vesoko_green_300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-vesoko_green_700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 w-full sm:w-auto min-h-[36px] touch-manipulation'
              >
                <Menu className='w-3 h-3 sm:w-4 sm:h-4 group-hover:text-vesoko_green_600 transition-colors duration-300 flex-shrink-0' />
                <span className='truncate max-w-[120px] xs:max-w-[140px] sm:max-w-40'>{getCurrentCategoryLabel()}</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 ${showCategoriesDropdown ? 'rotate-180 text-vesoko_green_600' : 'group-hover:text-vesoko_green_600'}`} />
              </button>
              
              {/* Categories Dropdown Menu - Mobile Optimized */}
              {showCategoriesDropdown && (
                <div className='absolute top-full left-0 mt-2 w-full sm:w-64 max-w-xs bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl z-50 animate-slide-up'>
                  <div className='p-1 sm:p-2 max-h-80 overflow-y-auto'>
                    {categories.map((category) => {
                      const IconComponent = typeof category.icon === 'string' ? null : category.icon;
                      const isSelected = category.value === currentCategory;
                      return (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryClick(category.value)}
                          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-lg transition-all duration-300 transform hover:scale-105 min-h-[44px] touch-manipulation ${
                            isSelected 
                              ? 'bg-vesoko_green_50 text-vesoko_green_700 border-l-4 border-vesoko_green_500 shadow-sm' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-vesoko_green_600'
                          }`}
                        >
                          {typeof category.icon === 'string' ? (
                            <span className='text-base sm:text-lg flex-shrink-0'>{category.icon}</span>
                          ) : (
                            IconComponent ? <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                              isSelected ? 'text-vesoko_green_600' : 'text-gray-500'
                            }`} /> : null
                          )}
                          <span className='font-medium text-sm sm:text-base truncate'>{category.label}</span>
                          {isSelected && (
                            <span className='ml-auto text-vesoko_green_600 font-bold flex-shrink-0'>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filters Button for Mobile */}
            <div className='flex sm:hidden'>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className='flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 bg-white hover:bg-vesoko_green_50 text-gray-700 hover:text-vesoko_green_700 border border-gray-200 hover:border-vesoko_green_300 min-h-[36px] touch-manipulation'
              >
                <Menu className='w-3 h-3 flex-shrink-0' />
                <span>Filters</span>
              </button>
            </div>

            {/* Quick Filters - Mobile Optimized (Show fewer on mobile) */}
            <div className='hidden sm:flex items-center gap-1 lg:gap-2'>
              {quickFilters.slice(0, 2).map((filter) => {
                const IconComponent = filter.icon;
                const isActive = currentFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={filter.action}
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 transform hover:scale-105 min-h-[36px] touch-manipulation ${
                      isActive 
                        ? 'bg-vesoko_green_600 text-white shadow-md' 
                        : 'bg-white hover:bg-vesoko_green_50 text-gray-700 hover:text-vesoko_green_700 border border-gray-200 hover:border-vesoko_green_300'
                    }`}
                  >
                    <IconComponent className='w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0' />
                    <span className='hidden lg:inline'>{filter.label}</span>
                  </button>
                );
              })}
              {/* Show all filters on larger screens */}
              <div className='hidden lg:flex items-center gap-2'>
                {quickFilters.slice(2).map((filter) => {
                  const IconComponent = filter.icon;
                  const isActive = currentFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      onClick={filter.action}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                        isActive 
                          ? 'bg-vesoko_green_600 text-white shadow-md' 
                          : 'bg-white hover:bg-vesoko_green_50 text-gray-700 hover:text-vesoko_green_700 border border-gray-200 hover:border-vesoko_green_300'
                      }`}
                    >
                      <IconComponent className='w-4 h-4' />
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side - Mobile Optimized Seller links and Customer Service */}
          <div className='flex items-center gap-1 sm:gap-2 lg:gap-3'>
            {/* Customer Service - Mobile Optimized */}
            <button
              onClick={handleCustomerServiceClick}
              className='hidden md:flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 transform hover:scale-105 min-h-[36px] touch-manipulation'
            >
              <span className='truncate'>Support</span>
            </button>

            {/* Seller Links - Mobile Optimized */}
            {userInfo ? (
              <>
                {!storeInfo && (
                  <Link
                    href='/select-store-type'
                    target='_blank'
                    className='flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-vesoko_green_600 hover:bg-vesoko_green_700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg min-h-[36px] touch-manipulation'
                  >
                    <SquareArrowOutUpRight className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                    <span className='hidden xs:inline truncate'>Sell</span>
                    <span className='hidden sm:inline truncate'>Become a Seller</span>
                  </Link>
                )}
                {storeInfo && (
                  <Link
                    href={`/${getSellerTypeBaseurl(storeInfo.storeType)}`}
                    className='flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-vesoko_dark_blue hover:bg-vesoko_dark_blue_2 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg min-h-[36px] touch-manipulation'
                  >
                    <span className='truncate max-w-[80px] sm:max-w-none'>Dashboard</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                href='/select-store-type'
                className='flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-vesoko_green_600 hover:bg-vesoko_green_700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg min-h-[36px] touch-manipulation'
              >
                <SquareArrowOutUpRight className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                <span className='hidden xs:inline truncate'>Sell</span>
                <span className='hidden sm:inline truncate'>Become a Seller</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4' ref={mobileFiltersRef}>
          <div className='bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>Quick Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className='text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='space-y-2'>
              {quickFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = currentFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    onClick={() => { setShowMobileFilters(false); filter.action(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-vesoko_green_600 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-vesoko_green_50 text-gray-700 hover:text-vesoko_green_700 border border-gray-200 hover:border-vesoko_green_300'
                    }`}
                  >
                    <IconComponent className='w-5 h-5 flex-shrink-0' />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>

            {hasActiveFilters() && (
              <button
                onClick={() => { setShowMobileFilters(false); handleClearFilters(); }}
                className='mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300'
              >
                <X className='w-4 h-4 flex-shrink-0' />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderBottom;

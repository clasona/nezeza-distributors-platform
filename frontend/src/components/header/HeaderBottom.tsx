import { getSellerTypeBaseurl } from '@/lib/utils';
import { ChevronDown, Menu, Star, Tag, Truck, Clock, SquareArrowOutUpRight, X } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current category from URL
  const currentCategory = router.query.category as string || 'all';
  const currentFilter = router.query.filter as string || '';

  // Categories from your product form
  const categories = [
    { value: 'all', label: 'All Categories', icon: Menu },
    { value: 'food', label: 'Food & Beverages', icon: '🍔' },
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
    <div className='w-full h-12 sm:h-10 bg-vesoko_light_blue text-sm text-black px-2 sm:px-4 flex items-center justify-between relative'>
      {/* Left side navigation */}
      <div className='flex items-center gap-1'>
        {/* Clear Filters - First item when filters are active */}
        {hasActiveFilters() && (
          <button
            onClick={handleClearFilters}
            className='flex items-center gap-1 h-8 px-2 border border-red-300 hover:border-red-500 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 cursor-pointer duration-300 rounded text-xs font-medium'
            title='Clear all filters'
          >
            <X className='w-3 h-3' />
            Clear Filters
          </button>
        )}
        
        {/* Categories Dropdown */}
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            className='flex items-center gap-1 h-8 px-2 border border-transparent hover:border-white cursor-pointer duration-300 rounded'
          >
            <Menu className='w-4 h-4' />
            <span className='truncate max-w-20 sm:max-w-32 text-xs sm:text-sm'>{getCurrentCategoryLabel()}</span>
            <ChevronDown className='w-3 h-3' />
          </button>
          
          {/* Categories Dropdown Menu */}
          {showCategoriesDropdown && (
            <div className='absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
              {categories.map((category) => {
                const IconComponent = typeof category.icon === 'string' ? null : category.icon;
                const isSelected = category.value === currentCategory;
                return (
                  <button
                    key={category.value}
                    onClick={() => handleCategoryClick(category.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      isSelected 
                        ? 'bg-blue-50 vesoko_dark_blue_2 border-l-4 border-blue-500' 
                        : 'text-gray-800'
                    }`}
                  >
                    {typeof category.icon === 'string' ? (
                      <span className='text-lg'>{category.icon}</span>
                    ) : (
                      IconComponent ? <IconComponent className={`w-4 h-4 ${
                        isSelected ? 'text-vesoko_dark_blue' : 'text-gray-600'
                      }`} /> : null
                    )}
                    <span className='text-sm'>{category.label}</span>
                    {isSelected && (
                      <span className='ml-auto text-blue-500'>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Filters */}
        {quickFilters.map((filter) => {
          const IconComponent = filter.icon;
          const isActive = currentFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={filter.action}
              className={`hidden md:flex items-center gap-1 h-8 px-2 border cursor-pointer duration-300 rounded ${
                isActive 
                  ? 'border-white bg-white/20 vesoko_dark_blue_2 font-medium' 
                  : 'border-transparent hover:border-white'
              }`}
            >
              <IconComponent className='w-3 h-3' />
              {filter.label}
            </button>
          );
        })}

        {/* Customer Service */}
        <button
          onClick={handleCustomerServiceClick}
          className='hidden lg:flex items-center gap-1 h-8 px-2 border border-transparent hover:border-white cursor-pointer duration-300 rounded'
        >
          Customer Service
        </button>
      </div>

      {/* Right side - Seller links */}
      <div className='flex items-center gap-2'>
        {userInfo ? (
          <>
            {/* Conditional rendering for "Become a Seller" */}
            {!storeInfo && (
              <Link
                href='/select-store-type'
                target='_blank'
                className='flex items-center gap-1 text-vesoko_dark_blue hover:text-vesoko_dark_blue_2 text-xs font-medium transition-colors'
              >
                <SquareArrowOutUpRight className='h-3 w-3' />
                Become a Seller
              </Link>
            )}
            {/* Seller Dashboard link */}
            {storeInfo && (
              <Link
                href={`/${getSellerTypeBaseurl(storeInfo.storeType)}`}
                className='flex items-center text-vesoko_dark_blue hover:vesoko_dark_blue_2 text-xs font-medium transition-colors'
              >
                Seller Dashboard
              </Link>
            )}
          </>
        ) : (
          /* Show for non-logged in users too */
          <Link
            href='/select-store-type'
            className='flex items-center gap-1 text-vesoko_dark_blue hover:vesoko_dark_blue_2 text-xs font-medium transition-colors'
          >
            <SquareArrowOutUpRight className='h-3 w-3' />
            Become a Seller
          </Link>
        )}
      </div>
    </div>
  );
};

export default HeaderBottom;

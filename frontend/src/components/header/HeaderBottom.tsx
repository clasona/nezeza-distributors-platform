import { getSellerTypeBaseurl } from '@/lib/utils';
import { ChevronDown, Menu, Star, Tag, Truck, Clock, SquareArrowOutUpRight, X, Utensils, ArrowUpDown, ArrowUp, ArrowDown, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../type';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderBottomProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  onCategorySelect?: (category: string) => void;
  onFilterSelect?: (filter: string) => void;
  onSortSelect?: (sort: string) => void;
}

const HeaderBottom = ({ 
  showSidebar, 
  setShowSidebar, 
  onCategorySelect,
  onFilterSelect,
  onSortSelect 
}: HeaderBottomProps) => {
  const { userInfo, storeInfo } = useSelector(
    (state: stateProps) => state.next
  );
  const router = useRouter();
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const mobileFiltersRef = useRef<HTMLDivElement>(null);
  
  // Get current category from URL
  const currentCategory = router.query.category as string || 'all';
  const currentFilter = router.query.filter as string || '';
  const currentSort = router.query.sort as string || '';

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
    { 
      key: 'trending', 
      label: 'Trending', 
      icon: TrendingUp,
      action: () => handleFilterClick('trending')
    },
    { 
      key: 'best_sellers', 
      label: 'Best Sellers', 
      icon: Star,
      action: () => handleFilterClick('best_sellers')
    },
  ];

  const sortOptions = [
    { 
      key: '', 
      label: 'Relevance', 
      icon: ArrowUpDown,
      description: 'Default sorting by relevance'
    },
    { 
      key: 'price_low_high', 
      label: 'Price: Low to High', 
      icon: ArrowUp,
      description: 'Sort by price ascending'
    },
    { 
      key: 'price_high_low', 
      label: 'Price: High to Low', 
      icon: ArrowDown,
      description: 'Sort by price descending'
    },
    { 
      key: 'rating_high_low', 
      label: 'Customer Rating', 
      icon: Star,
      description: 'Sort by highest rated products'
    },
    { 
      key: 'newest', 
      label: 'Newest First', 
      icon: Clock,
      description: 'Sort by newest products'
    },
    { 
      key: 'name_a_z', 
      label: 'Name: A to Z', 
      icon: ArrowUp,
      description: 'Sort alphabetically A-Z'
    },
    { 
      key: 'name_z_a', 
      label: 'Name: Z to A', 
      icon: ArrowDown,
      description: 'Sort alphabetically Z-A'
    },
  ];

  // Handle scroll behavior for sticky header
  useEffect(() => {
    const controlHeaderVisibility = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        // Always keep visible, but close dropdowns when scrolling fast
        if (Math.abs(currentScrollY - lastScrollY) > 50) {
          // Close any open dropdowns when scrolling fast
          setShowCategoriesDropdown(false);
          setShowSortDropdown(false);
          setShowMobileFilters(false);
        }
        
        // Always show the header (keep it sticky)
        setIsVisible(true);
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeaderVisibility, { passive: true });
      return () => window.removeEventListener('scroll', controlHeaderVisibility);
    }
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
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
      query: { ...router.query, filter }
    });
    
    // Scroll to products
    scrollToProducts();
    
    // Call callback if provided
    onFilterSelect?.(filter);
  };

  const handleSortClick = (sort: string) => {
    setShowSortDropdown(false);
    
    // Navigate to home page with sort
    const query = { ...router.query };
    if (sort) {
      query.sort = sort;
    } else {
      delete query.sort;
    }
    
    router.push({
      pathname: '/',
      query
    });
    
    // Scroll to products
    scrollToProducts();
    
    // Call callback if provided
    onSortSelect?.(sort);
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
    return currentCategory !== 'all' || currentFilter !== '' || currentSort !== '' || router.query.search;
  };

  // Get current category display text
  const getCurrentCategoryLabel = () => {
    const category = categories.find(cat => cat.value === currentCategory);
    return category ? category.label : 'All Categories';
  };

  // Get current sort display text
  const getCurrentSortLabel = () => {
    const sort = sortOptions.find(opt => opt.key === currentSort);
    return sort ? sort.label : 'Sort By';
  };

  return (
    <div className={`w-full bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 shadow-sm backdrop-blur-sm sticky top-16 sm:top-20 z-40 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
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
                className='group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-vesoko_background border border-gray-300 hover:border-vesoko_primary rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-vesoko_primary_dark transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 w-full sm:w-auto min-h-[36px] touch-manipulation'
              >
                <Menu className='w-3 h-3 sm:w-4 sm:h-4 group-hover:text-vesoko_primary transition-colors duration-300 flex-shrink-0' />
                <span className='truncate max-w-[120px] xs:max-w-[140px] sm:max-w-40'>{getCurrentCategoryLabel()}</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 ${showCategoriesDropdown ? 'rotate-180 text-vesoko_primary' : 'group-hover:text-vesoko_primary'}`} />
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
                              : 'text-gray-700 hover:bg-gray-50 hover:text-vesoko_primary'
                          }`}
                        >
                          {typeof category.icon === 'string' ? (
                            <span className='text-base sm:text-lg flex-shrink-0'>{category.icon}</span>
                          ) : (
                            IconComponent ? <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                              isSelected ? 'text-vesoko_primary' : 'text-gray-500'
                            }`} /> : null
                          )}
                          <span className='font-medium text-sm sm:text-base truncate'>{category.label}</span>
                          {isSelected && (
                            <span className='ml-auto text-vesoko_primary font-bold flex-shrink-0'>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

       {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className='group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white hover:bg-vesoko_background border border-gray-200 hover:border-vesoko_primary rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-vesoko_primary_dark transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 min-h-[36px] touch-manipulation'
                >
                  <ArrowUpDown className='w-3 h-3 sm:w-4 sm:h-4 group-hover:text-vesoko_primary transition-colors duration-300 flex-shrink-0' />
                  <span className='truncate max-w-[80px] sm:max-w-[120px]'>{getCurrentSortLabel()}</span>
                  <ChevronDown className='w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 flex-shrink-0 group-hover:text-vesoko_primary' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-64 max-w-xs bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl z-50 animate-slide-up'>
                <DropdownMenuLabel className='text-gray-900 font-semibold px-3 py-2 text-xs'>SORT BY</DropdownMenuLabel>
                <DropdownMenuSeparator className='bg-gray-200' />
                {sortOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = option.key === currentSort;
                  return (
                    <DropdownMenuItem
                      key={option.key}
                      onClick={() => handleSortClick(option.key)}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 min-h-[36px] touch-manipulation text-xs ${
                        isSelected
                          ? 'bg-vesoko_primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-vesoko_primary'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                      <div className='flex-1 min-w-0'>
                        <div className='font-medium text-xs truncate'>{option.label}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>{option.description}</div>
                      </div>
                      {isSelected && (
                        <span className='text-white font-bold flex-shrink-0 text-xs'>✓</span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
      {/* Quick Filters Button for Mobile */}
      <div className='flex sm:hidden' ref={mobileFiltersRef}>
        <DropdownMenu open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <DropdownMenuTrigger asChild>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className='flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 bg-white hover:bg-vesoko_background text-gray-700 hover:text-vesoko_primary_dark border border-gray-200 hover:border-vesoko_primary min-h-[36px] touch-manipulation'
            >
              <Menu className='w-3 h-3 flex-shrink-0' />
              <span>Filters</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start' className='w-[90vw] max-w-sm bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl z-[100] animate-slide-up p-4' style={{ maxHeight: '80vh', overflowY: 'auto' }}>

            <DropdownMenuLabel className='text-gray-900 font-semibold px-3 py-2 text-xs mt-2'>QUICK FILTERS</DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-gray-200' />
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              const isActive = currentFilter === filter.key;
              return (
                <DropdownMenuItem
                  key={filter.key}
                  onClick={() => { setShowMobileFilters(false); filter.action(); }}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 min-h-[32px] touch-manipulation text-xs ${
                    isActive
                      ? 'bg-vesoko_primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-vesoko_primary'
                  }`}
                >
                  <IconComponent className='w-4 h-4 flex-shrink-0' />
                  <span className='font-medium text-xs truncate'>{filter.label}</span>
                  {isActive && <span className='ml-auto text-white font-bold text-xs'>✓</span>}
                </DropdownMenuItem>
              );
            })}
            {hasActiveFilters() && (
              <DropdownMenuSeparator className='bg-gray-200 mt-2' />
            )}
            {hasActiveFilters() && (
              <DropdownMenuItem
                onClick={() => { setShowMobileFilters(false); handleClearFilters(); }}
                className='mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300'
              >
                <X className='w-4 h-4 flex-shrink-0' />
                <span>Clear All Filters</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

          

            {/* Quick Filters - Mobile Optimized (Show fewer on mobile) */}
            <div className='hidden sm:flex items-center gap-1 lg:gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs lg:text-sm font-medium bg-white hover:bg-vesoko_background text-gray-700 hover:text-vesoko_primary_dark border border-gray-200 hover:border-vesoko_primary min-h-[36px] touch-manipulation transition-all duration-300'>
                    <Tag className='w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0' />
                    <span className='hidden lg:inline'>Quick Filters</span>
                    <ChevronDown className='w-3 h-3 flex-shrink-0' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56 max-w-xs bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl z-50 animate-slide-up'>
                  <DropdownMenuLabel className='text-gray-900 font-semibold px-3 py-2 text-xs'>QUICK FILTERS</DropdownMenuLabel>
                  <DropdownMenuSeparator className='bg-gray-200' />
                  {quickFilters.map((filter) => {
                    const IconComponent = filter.icon;
                    const isActive = currentFilter === filter.key;
                    return (
                      <DropdownMenuItem
                        key={filter.key}
                        onClick={filter.action}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 min-h-[32px] touch-manipulation text-xs ${
                          isActive
                            ? 'bg-vesoko_primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-vesoko_primary'
                        }`}
                      >
                        <IconComponent className='w-4 h-4 flex-shrink-0' />
                        <span className='font-medium text-xs truncate'>{filter.label}</span>
                        {isActive && <span className='ml-auto text-white font-bold text-xs'>✓</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
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
                    href='/sellers'
                    target='_blank'
                    className='flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-vesoko_primary hover:bg-vesoko_primary_dark text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg min-h-[36px] touch-manipulation'
                  >
                    <SquareArrowOutUpRight className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                    <span className='hidden xs:inline truncate'>Sell</span>
                    <span className='hidden sm:inline truncate'>Become a Seller</span>
                  </Link>
                )}
                {storeInfo && (
                  <Link
                    href={`/${getSellerTypeBaseurl(storeInfo.storeType)}`}
                    className='flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-vesoko_primary hover:bg-vesoko_primary_2 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg min-h-[36px] touch-manipulation'
                  >
                    <span className='truncate max-w-[80px] sm:max-w-none'>Dashboard</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                href='/sellers'
                className='flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-vesoko_primary hover:bg-vesoko_primary_dark text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg min-h-[36px] touch-manipulation'
              >
                <SquareArrowOutUpRight className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                <span className='hidden xs:inline truncate'>Sell</span>
                <span className='hidden sm:inline truncate'>Become a Seller</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Filters Overlay is now handled by DropdownMenu above. */}
    </div>
  );
};

export default HeaderBottom;

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Banner from '@/components/Banner';
import Products from '@/components/Products';
import { getRetailersProducts } from '@/utils/product/getProductsBySeller';
import { ProductProps } from '../../type';
import Header from '@/components/header/Header';
import HeaderBottom from '@/components/header/HeaderBottom';
import Footer from '@/components/Footer';

const Home = () => {
  const router = useRouter();
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [currentFilter, setCurrentFilter] = useState<string>('');
  
  // Track if search query update is from URL to prevent infinite loop
  const isUpdatingFromURL = useRef(false);

  // Fetch products based on filters
  const fetchProducts = useCallback(async (filters?: {
    searchQuery?: string;
    category?: string;
    filter?: string;
  }) => {
    try {
      setIsSearching(true);
      const data = await getRetailersProducts(filters);
      
      // Sort products by rating (highest first), then by number of reviews
      const sortedProducts = (data || []).sort((a: ProductProps, b: ProductProps) => {
        // First sort by rating (descending)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // If ratings are equal, sort by number of reviews (descending)
        return (b.numOfReviews || 0) - (a.numOfReviews || 0);
      });
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle URL parameters and fetch products accordingly
  useEffect(() => {
    const { category, filter, search } = router.query;
    
    const filters = {
      searchQuery: search as string || '',
      category: category as string || 'all',
      filter: filter as string || ''
    };
    
    setCurrentCategory(filters.category);
    setCurrentFilter(filters.filter);
    
    // Sync search query state with URL parameter and mark as URL update
    isUpdatingFromURL.current = true;
    setSearchQuery(search as string || '');
    
    // Fetch products based on URL parameters
    fetchProducts(filters);
  }, [router.query, fetchProducts]);

  // Handler for search field in Header with debouncing
  const handleSearchChange = useCallback((query: string) => {
    isUpdatingFromURL.current = false; // Mark as user input
    setSearchQuery(query);
    
    // If user is typing, scroll to products
    const productsTop = document.querySelector('.products-top');
    if (productsTop) {
      window.scrollTo({
        top: (productsTop as HTMLElement).offsetTop,
        behavior: 'smooth',
      });
    }
  }, []);

  // Separate effect for debounced search (only for user input)
  useEffect(() => {
    // Skip if this is an update from URL
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const newQuery = { ...router.query };
      
      if (searchQuery.trim()) {
        // Add search query to URL
        newQuery.search = searchQuery;
      } else {
        // Remove search query from URL if empty
        delete newQuery.search;
      }
      
      // Update URL with new query parameters
      router.push({
        pathname: '/',
        query: newQuery
      }, undefined, { shallow: true });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, router]);

  // Handlers for HeaderBottom callbacks
  const handleCategorySelect = useCallback((category: string) => {
    setCurrentCategory(category);
    // URL update is handled by HeaderBottom component
  }, []);

  const handleFilterSelect = useCallback((filter: string) => {
    setCurrentFilter(filter);
    // URL update is handled by HeaderBottom component
  }, []);
  // Scroll to products
  const handleBuyClick = () => {
    const productsTop = document.querySelector('.products-top');
    if (productsTop) {
      window.scrollTo({
        top: (productsTop as HTMLElement).offsetTop,
        behavior: 'smooth',
      });
    } else {
      console.error("Element with class 'products-top' not found.");
    }
  };

  // Handle category click from homepage categories
  const handleCategoryClick = (category: string) => {
    // Navigate to home page with category filter
    const query = category === 'all' ? {} : { category };
    router.push({
      pathname: '/',
      query
    });
    
    // Scroll to products after navigation
    setTimeout(() => {
      const productsTop = document.querySelector('.products-top');
      if (productsTop) {
        window.scrollTo({
          top: (productsTop as HTMLElement).offsetTop - 100,
          behavior: 'smooth',
        });
      }
    }, 100);
  };
  return (
    <div className='flex flex-col min-h-screen bg-vesoko_powder_blue'>
      <Header onSearchChange={handleSearchChange} searchQuery={searchQuery} />
      <HeaderBottom 
        showSidebar={false}
        setShowSidebar={() => {}}
        onCategorySelect={handleCategorySelect}
        onFilterSelect={handleFilterSelect}
      />
      <main className='flex-1'>
        <div className='bg-gradient-to-br from-vesoko_powder_blue via-blue-50 to-white'>
          <Banner onBuyClick={handleBuyClick} />
          
          {/* Featured Categories Section - Commented out since categories are in HeaderBottom */}
          {/* <section className='py-8 sm:py-12 lg:py-16 px-2 sm:px-4'>
            <div className='max-w-7xl mx-auto'>
              <div className='text-center mb-8 sm:mb-12'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>Explore Authentic African Products</h2>
                <p className='text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2'>Discover authentic African goods across all categories, connecting producers to global markets</p>
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
                {[
                  { value: 'food', label: 'Food & Beverages', icon: '🍽️' },
                  { value: 'electronics', label: 'Electronics', icon: '📱' },
                  { value: 'clothing', label: 'Clothing & Fashion', icon: '👕' },
                  { value: 'furniture', label: 'Furniture & Home', icon: '🪑' }
                ].map((category, index) => (
                  <div 
                    key={category.value} 
                    className='group cursor-pointer animate-fade-in touch-manipulation' 
                    style={{animationDelay: `${index * 100}ms`}}
                    onClick={() => handleCategoryClick(category.value)}
                  >
                    <div className='bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center items-center text-center'>
                      <div className='w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-vesoko_green_600 to-vesoko_dark_blue rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300'>
                        <span className='text-lg sm:text-xl lg:text-2xl text-white'>{category.icon}</span>
                      </div>
                      <h3 className='font-semibold text-xs sm:text-sm lg:text-base text-gray-900 group-hover:text-vesoko_dark_blue transition-colors leading-tight'>{category.label}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section> */}
          
          {/* Products Section */}
          <section className='py-16 px-2 sm:px-4 lg:px-6 xl:px-8'>
            <div className='max-w-8xl mx-auto'>
              <div className='text-center mb-12 px-4'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Featured African Products</h2>
                <p className='text-lg text-gray-600 max-w-2xl mx-auto'>Explore the finest selection of authentic African products, handpicked from trusted manufacturers and sellers</p>
              </div>
              <div className='min-h-[400px]'>
                <Products products={products} isLoading={isSearching} />
              </div>
            </div>
          </section>
          
          {/* Coming Soon Section */}
          <section className='py-16 px-4 bg-gradient-to-r from-orange-100 to-yellow-100'>
            <div className='max-w-7xl mx-auto'>
              <div className='text-center mb-12'>
                <div className='inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4'>Coming Soon - Phase 2</div>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Direct from Africa</h2>
                <p className='text-lg text-gray-600 max-w-2xl mx-auto'>We're building infrastructure to connect African-based manufacturers directly to global wholesalers. African businesses based in Africa will soon join our platform to expand their reach worldwide.</p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='bg-white rounded-2xl p-8 shadow-lg'>
                  <div className='text-4xl mb-4'>🏭</div>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>African Manufacturers</h3>
                  <p className='text-gray-600'>Direct access for manufacturers based in African countries to export their authentic products globally.</p>
                </div>
                <div className='bg-white rounded-2xl p-8 shadow-lg'>
                  <div className='text-4xl mb-4'>📦</div>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>Global Logistics</h3>
                  <p className='text-gray-600'>Complete shipping, compliance, and logistics support for seamless international trade.</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className='py-16 px-4 bg-white/50'>
            <div className='max-w-7xl mx-auto'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Why Choose VeSoko?</h2>
                <p className='text-lg text-gray-600 max-w-2xl mx-auto'>Discover what makes VeSoko unique - an end-to-end supply chain solution connecting African sellers to global markets</p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {[
                  {
                    icon: '🌍',
                    title: 'Global Supply Chain',
                    description: 'End-to-end platform connecting African manufacturers to wholesalers and retailers worldwide'
                  },
                  {
                    icon: '🏛️',
                    title: 'Authentic African Products',
                    description: 'Exclusively featuring genuine products from African producers and trusted sellers'
                  },
                  {
                    icon: '🤝',
                    title: 'Trusted Network',
                    description: 'Building bridges between African sellers, global wholesalers, and local retailers'
                  }
                ].map((feature, index) => (
                  <div key={feature.title} className='text-center animate-slide-up' style={{animationDelay: `${index * 200}ms`}}>
                    <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
                      <div className='text-4xl mb-4'>{feature.icon}</div>
                      <h3 className='text-xl font-bold text-gray-900 mb-3'>{feature.title}</h3>
                      <p className='text-gray-600'>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

Home.noLayout = true;
export default Home;

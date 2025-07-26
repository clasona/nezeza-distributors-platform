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
        <div className='bg-vesoko_powder_blue'>
          <Banner onBuyClick={handleBuyClick} />
          <div className='min-h-[400px]'> {/* Ensure minimum height for content area */}
            <Products products={products} isLoading={isSearching} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

Home.noLayout = true;
export default Home;

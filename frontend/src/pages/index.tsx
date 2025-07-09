import React, { useCallback, useEffect, useState } from 'react';
import Banner from '@/components/Banner';
import Products from '@/components/Products';
import { getRetailersProducts } from '@/utils/product/getProductsBySeller';
import { ProductProps } from '../../type';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';

const Home = () => {
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch products once on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getRetailersProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // Handler for search field in Header
  const handleSearchChange = useCallback((query: string) => {
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

  // Filter products by searchQuery
  const filteredProducts = products.filter(
    (product: ProductProps) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
    <main>
      <Header onSearchChange={handleSearchChange} searchQuery={searchQuery} />
      <div className='bg-vesoko_powder_blue'>
        <Banner onBuyClick={handleBuyClick} />
        <Products products={filteredProducts} />
      </div>
      <Footer />
    </main>
  );
};

Home.noLayout = true;
export default Home;

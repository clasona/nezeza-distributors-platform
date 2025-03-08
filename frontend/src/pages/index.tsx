import React from 'react';
import Banner from "@/components/Banner";
import Products from "@/components/Products";

export default function Home() {
   const handleBuyClick = () => {
     const bannerBottom = document.querySelector('.products-top');
     if (bannerBottom) {
       window.scrollTo({
         top: (bannerBottom as HTMLElement).offsetTop, 
         behavior: 'smooth',
       });
     } else {
       console.error("Element with class 'banner-bottom' not found.");
     }
   };
  return (
    <main>
      <div className='bg-nezeza_powder_blue'>
        <Banner onBuyClick={handleBuyClick} />
        <Products />
      </div>
    </main>
  );
}


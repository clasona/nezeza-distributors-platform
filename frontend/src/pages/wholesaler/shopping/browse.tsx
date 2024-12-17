import Banner from '@/components/Banner';
import Products from '@/components/Products';
import React from 'react';
import mockProducts from '../mock-data/mockProducts';
import WholesalerLayout from '..';
import Heading from '@/components/Heading';
import HeaderBottom from '@/components/header/HeaderBottom';
import Cart from '@/components/Cart';
import { useSelector } from 'react-redux';
import { stateProps } from '../../../../type';
import PageHeader from '@/components/PageHeader';

const Shopping = () => {
    const productData = mockProducts;
      const { cartProductData } = useSelector((state: stateProps) => state.next);

  return (
    <WholesalerLayout>
      <div>
        {/* <Heading title='Shopping Browsing' /> */}
        <PageHeader
          heading='Shopping Browsing'
          extraComponent={<Cart productData={cartProductData} />}
        />
        {/* <Cart productData={cartProductData} /> */}
        <HeaderBottom />
        <Banner />
        <Products productData={productData} />
      </div>
    </WholesalerLayout>
  );
};
Shopping.noLayout = true;
export default Shopping;

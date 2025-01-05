import Image from "next/image";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Header from "@/components/header/Header";
import HeaderBottom from "@/components/header/HeaderBottom";
import Footer from "@/components/Footer";
import Banner from "@/components/Banner";
import Products from "@/components/Products";
import { ProductProps } from "../../type"
// import { getServerSideProps } from './utils/fetchProducts';

interface Props{
  productData: ProductProps;
}

export default function Home({ productData }: Props) {
  // productData = getServerSideProps;
  // console.log(productData)
  return (
    <main> 
      <div className='bg-nezeza_powder_blue'>
        <Banner />
        <Products productData={productData}/>
      </div>
      
    </main>
  );
}

// export const getServerSideProps = async() =>{
//   const res = await fetch("https://fakestoreapi.com/products")
//   const productData = await res.json();
//   return {props: {productData}};
// }

export const getServerSideProps = async () => {
  const productData = await fetchProducts();
  return { props: { productData } };
};

const fetchProducts = async () => { 
  try {
    const response = await fetch('http://localhost:8000/api/v1/marketplace/products');
    const data = await response.json();
    const productsData = data.products;

    if (!response.ok) {
      console.log('products data not fetched.')
      // console.log(productsData);
    } else {
      console.log('products data fetched successfully...');
      // console.log(productsData);
      return productsData;

    }
  } catch (error) {
    console.error('Error fetching products data:', error);
  }
}

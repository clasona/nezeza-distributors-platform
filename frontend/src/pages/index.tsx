import Image from "next/image";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import Header from "@/components/header/Header";
import HeaderBottom from "@/components/header/HeaderBottom";
import Footer from "@/components/Footer";
import Banner from "@/components/Banner";
import Products from "@/components/Products";
import {ProductProps} from "../../type"
// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

interface Props{
  productData: ProductProps;
}

export default function Home({productData} : Props) {
  // console.log(productData);
  return (
    <main> 
      <div>
        <Banner />
        <Products productData={productData}/>
      </div>
      
    </main>
  );
}

export const getServerSideProps = async() =>{
  const res = await fetch("https://fakestoreapi.com/products")
  const productData = await res.json();
  return {props: {productData}};
}

// export const getProducts = async () => {
//   console.log("Yvessssss");
//   // const res = await fetch()
//   const test = [
//     {
//       id: 1,
//       name: 'John Doe',
//       email: 'johndoe@example.com',
//       age: 30,
//     },
//     {
//       id: 2,
//       name: 'Jane Smith',
//       email: 'janesmith@example.com',
//       age: 25,
//     },
//   ]

//   console.log(test)
//   // const productData = {await} 
// }
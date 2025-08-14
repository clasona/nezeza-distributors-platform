// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import { Star, Heart, ShoppingCart } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { getSingleProduct } from '@/utils/product/getSingleProduct';

// const ProductDetails = () => {
//   const router = useRouter();
//   const { id } = router.query;
// const [product, setProduct] = useState<ProductProps | null>(null);

//   useEffect(() => {
//     if (id) {
//       getSingleProduct(id).then(setProduct).catch(console.error);
//     }
//   }, [id]);

//   if (!product) return <p>Loading...</p>;

//   return (
//     <div className='container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
//       {/* Product Images */}
//       <div className='flex flex-col items-center'>
//         <Image
//           src={product.image}
//           alt={product.title}
//           className='w-96 h-96 object-cover'
//         />
//       </div>

//       {/* Product Info */}
//       <div>
//         <h1 className='text-2xl font-bold'>{product.title}</h1>
//         <p className='text-gray-600'>{product.description}</p>
//         <p className='text-xl font-semibold mt-2'>
//           $ {product.price.toFixed(2)}
//         </p>

//         {/* Ratings */}
//         <div className='flex items-center mt-2'>
//           {[...Array(5)].map((_, i) => (
//             <Star
//               key={i}
//               className={`h-5 w-5 ${
//                 i < product.rating ? 'text-yellow-500' : 'text-gray-300'
//               }`}
//             />
//           ))}
//           <span className='ml-2 text-gray-600'>
//             {product.reviewsCount} reviews
//           </span>
//         </div>

//         {/* Actions */}
//         <div className='mt-4 flex gap-4'>
//           <Button className='bg-vesoko_primary text-white flex items-center'>
//             <ShoppingCart className='mr-2' /> Add to Cart
//           </Button>
//           <Button className='bg-green-500 text-white'>Buy Now</Button>
//           <Button className='border border-gray-300 flex items-center'>
//             <Heart className='mr-2 text-red-500' /> Add to Favorites
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;

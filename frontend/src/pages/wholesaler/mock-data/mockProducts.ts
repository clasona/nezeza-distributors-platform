import { ProductProps } from "../../../../type";

const sampleProducts: ProductProps[] = [
  {
    _id: 1,
    title: 'Akabanga',
    description: 'A traditional Kenyan spice',
    price: 5,
    quantity: 100,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akabanga.png',
    category: 'kitchen',
    // storeId: 1, //must get from current logged in
  },
  {
    _id: 2,
    title: 'Akanozo',
    description: 'A traditional Rwandan flour',
    price: 47,
    quantity: 150,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akanozo.png',
    category: 'kitchen',
    // storeId: 1, //must get from current logged in
  },
  {
    _id: 3,
    title: 'Akarabo',
    description: 'A traditional Rwandan biscuit',
    price: 116,
    quantity: 34,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/akarabo.png',
    category: 'kitchen',
    // storeId: 1, //must get from current logged in
  },
  {
    _id: 4,
    title: 'Kinazi',
    description: 'A traditional Rwandan flour',
    price: 215,
    quantity: 3,
    image: 'https://nezeza-products.s3.us-east-2.amazonaws.com/kinazi.jpg',
    category: 'kitchen',
    // storeId: 1, //must get from current logged in
  },
];

export default sampleProducts;
import { createSlice } from '@reduxjs/toolkit';
import { StoreProduct, StoreProps } from '../../type';

interface NextState {
  productData: StoreProduct[];
  favoriteData: StoreProduct[];
  // cartData: StoreProduct[];
  allProducts: StoreProduct[];
  userInfo: null | string;
  storeInfo: null | StoreProps; //TODO: change this type to StoreProps
}

const initialState: NextState = {
  productData: [],
  favoriteData: [],
  // cartData: [],
  allProducts: [],
  userInfo: null,
  storeInfo: null,
  // orderData:[]
};

export const nextSlice = createSlice({
  name: 'next',
  initialState,
  reducers: {
    //add product to cart or increase its quantity if exists already
    addToCart: (state, action) => {
      //check if item was already added and just increase its number
      const existingProduct = state.productData.find(
        (item: StoreProduct) => item.id === action.payload.id
      );
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
        // return;
      } else {
        state.productData.push(action.payload);
      }
    },
    addToFavorite: (state, action) => {
      const existingProduct = state.favoriteData.find(
        (item: StoreProduct) => item.id === action.payload.id
      );
      if (existingProduct) {
        existingProduct.quantity += action.payload.quantity;
      } else {
        state.favoriteData.push(action.payload);
      }
    },

    //increase product qty in cart
    increaseQuantity: (state, action) => {
      const existingProduct = state.productData.find(
        (item: StoreProduct) => item.id === action.payload.id
      );
      existingProduct && existingProduct.quantity++;
    },

    //decrease product qty in cart
    decreaseQuantity: (state, action) => {
      const existingProduct = state.productData.find(
        (item: StoreProduct) => item.id === action.payload.id
      );
      if (existingProduct?.quantity === 1) {
        existingProduct.quantity = 1;
      } else {
        existingProduct!.quantity--;
      }
    },

    //delete product from cart
    deleteProduct: (state, action) => {
      state.productData = state.productData.filter(
        (item) => item.id !== action.payload
      );
    },

    // empty cart
    resetCart: (state) => {
      state.productData = [];
    },

    // add a user info to cart for checkout
    addUser: (state, action) => {
      state.userInfo = action.payload;
    },

    // remove user info from cart
    removeUser: (state) => {
      state.userInfo = null;
    },

    // add a store info to cart for checkout
    addStore: (state, action) => {
      state.storeInfo = action.payload;
    },

    // remove store info from cart
    removeStore: (state) => {
      state.storeInfo = null;
    },

    // set all products data to cart
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
  },
});

export const {
  addToCart,
  addToFavorite,
  increaseQuantity,
  decreaseQuantity,
  deleteProduct,
  resetCart,
  addUser,
  removeUser,
  addStore,
  removeStore,
  setAllProducts,
} = nextSlice.actions;
export default nextSlice.reducer;

import { clearCart } from '@/utils/cart/clearCart';
import { clearFavorites } from '@/utils/favorites/clearFavorites';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { OrderItemsProps, PaymentProps, ProductProps, StoreProps } from '../../type';

interface NextState {
  productData: OrderItemsProps[];
  favoritesItemsData: OrderItemsProps[];
  cartItemsData: OrderItemsProps[];
  allProducts: OrderItemsProps[];
  userInfo: null | string;
  storeInfo: null | StoreProps;
  paymentInfo: null | PaymentProps;
  buyNowProduct: {
    product: ProductProps;
    quantity: number;
    isBuyNow?: boolean;
  } | null;
}

const initialState: NextState = {
  productData: [],
  favoritesItemsData: [],
  cartItemsData: [],
  allProducts: [],
  userInfo: null,
  storeInfo: null,
  paymentInfo: null,
  buyNowProduct: null,
  // orderData:[]
};

// Async thunk for clearing the cart on the server
export const clearCartOnServer = createAsyncThunk('cart/clear', async () => {
  try {
    const response = await clearCart(); // Call the API function
    return response; // You can return the response if needed
  } catch (error) {
    console.error('Error clearing cart on server:', error);
    throw error; // Re-throw the error for handling in the rejected case
  }
});

// Async thunk for clearing the favorites on the server
export const clearFavoritesOnServer = createAsyncThunk(
  'favorites/clear',
  async () => {
    try {
      const response = await clearFavorites(); // Call the API function
      return response; // You can return the response if needed
    } catch (error) {
      console.error('Error clearing favorites on server:', error);
      throw error; // Re-throw the error for handling in the rejected case
    }
  }
);
export const nextSlice = createSlice({
  name: 'next',
  initialState,
  reducers: {
    //add product to cart or increase its quantity if exists already
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existingProduct = state.cartItemsData.find(
        (item: OrderItemsProps) => item.product._id === product._id // Use product._id
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        const newItem: OrderItemsProps = {
          // _id: product._id, // Or generate a new ID if needed
          title: product.title,
          price: product.price,
          quantity: quantity,
          description: product.description,
          category: product.category,
          image: product.image,
          product: product, // Store the entire product object
          sellerStoreId: product.storeId,
          addedToInventory: product.addedToInventory,
        };
        state.cartItemsData.push(newItem);
      }
    },
    setCartItems: (state, action) => {
      // Add setCartItems reducer here
      state.cartItemsData = action.payload;
    },

    addToFavorites: (state, action) => {
      const { product, quantity } = action.payload;
      const existingProduct = state.favoritesItemsData.find(
        (item: OrderItemsProps) => item.product._id === product._id // Use product._id
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        const newItem: OrderItemsProps = {
          // _id: product._id, // Or generate a new ID if needed
          title: product.title,
          price: product.price,
          quantity: quantity,
          description: product.description,
          category: product.category,
          image: product.image,
          product: product, // Store the entire product object
          sellerStoreId: product.storeId,
          addedToInventory: product.addedToInventory,
        };
        state.favoritesItemsData.push(newItem);
      }
    },
    setFavoritesItems: (state, action) => {
      state.favoritesItemsData = action.payload;
    },

    // New Reducer for Buy Now product
    setBuyNowProduct: (state, action) => {
      const { product, quantity } = action.payload;
      state.buyNowProduct = { product, quantity, isBuyNow: true }; 
    },
    // New Reducer to clear Buy Now product after purchase
    clearBuyNowProduct: (state) => {
      state.buyNowProduct = null;
    },

    //increase product qty in cart
    increaseQuantity: (state, action) => {
      const existingProduct = state.cartItemsData.find(
        (item: OrderItemsProps) => item.product._id === action.payload.id
      );
      existingProduct && existingProduct.quantity++;
    },

    //decrease product qty in cart
    decreaseQuantity: (state, action) => {
      const existingProduct = state.cartItemsData.find(
        (item: OrderItemsProps) => item.product._id === action.payload.id
      );
      if (existingProduct?.quantity === 1) {
        existingProduct.quantity = 1;
      } else {
        existingProduct!.quantity--;
      }
    },

    //delete product from cart
    deleteCartProduct: (state, action) => {
      const idToRemove = action.payload;

      const newCartItems = state.cartItemsData.filter((item) => {
        // Create a NEW array
        if (item.product && item.product._id) {
          return item.product._id !== idToRemove;
        } else {
          console.warn('Item in cart is missing product data:', item);
          return true;
        }
      });

      state.cartItemsData = newCartItems; // Assign the NEW array to the state
      console.log('cartItemsData after delete:', state.cartItemsData);
    },

    // empty cart
    resetCart: (state) => {
      state.cartItemsData = [];
    },

    deleteFavoritesProduct: (state, action) => {
      const idToRemove = action.payload;

      const newFavorites = state.favoritesItemsData.filter((item) => {
        // Create a NEW array
        if (item.product && item.product._id) {
          return item.product._id !== idToRemove;
        } else {
          console.warn('Item in favorites is missing product data:', item);
          return true;
        }
      });

      state.favoritesItemsData = newFavorites; // Assign the NEW array to the state
      console.log('favorites Data after delete:', state.favoritesItemsData);
    },

    resetFavorites: (state) => {
      state.favoritesItemsData = [];
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

    // add a store info to cart for checkout
    addPayment: (state, action) => {
      state.paymentInfo = action.payload;
    },

    // remove store info from cart
    removePayment: (state) => {
      state.paymentInfo = null;
    },

    // set all products data to cart
    setAllProducts: (state, action) => {
      state.allProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearCartOnServer.fulfilled, (state) => {
      // No need to clear cart here, resetCart reducer already does it
    });
    builder.addCase(clearCartOnServer.rejected, (state, action) => {
      // Handle error, e.g., display a message to the user
      console.error('Cart clear on server rejected:', action.error.message);
    });
  },
});

export const {
  addToCart,
  addToFavorites,
  setCartItems,
  setFavoritesItems,
  setBuyNowProduct,
  clearBuyNowProduct,
  increaseQuantity,
  decreaseQuantity,
  deleteCartProduct,
  deleteFavoritesProduct,
  resetCart,
  resetFavorites,
  addUser,
  removeUser,
  addStore,
  removeStore,
  addPayment,
  removePayment,
  setAllProducts,
} = nextSlice.actions;
export default nextSlice.reducer;

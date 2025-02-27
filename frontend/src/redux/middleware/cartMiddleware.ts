// redux/middleware/cartMiddleware.ts (or thunk)
import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import { addToCart, setCartItems } from '../nextSlice'; // Adjust import path
// import { setSuccessMessage } from '../nextSlice'; // import setSuccessMessage

export const cartMiddleware =
  (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
    const result = next(action);

    if (action.type === addToCart.type) {
      store.dispatch(setSuccessMessage('Added successfully!'));
    }

    return result;
  };

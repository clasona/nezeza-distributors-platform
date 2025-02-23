import { OrderItemsProps } from "../../../type";

export  const mergeCartItems = (
  localCart: OrderItemsProps[],
  serverCart: OrderItemsProps[]
) => {
  const mergedCart: OrderItemsProps[] = [...localCart]; // Start with the local cart

  serverCart.forEach((serverItem) => {
    const existingLocalItemIndex = mergedCart.findIndex(
      (localItem) => localItem.product._id === serverItem.product._id
    );

    if (existingLocalItemIndex !== -1) {
      // Create a *new* object with the updated quantity
      const updatedItem = {
        ...mergedCart[existingLocalItemIndex],
        quantity:
          mergedCart[existingLocalItemIndex].quantity + serverItem.quantity,
      };

      // Replace the old item in the array with the new one
      mergedCart[existingLocalItemIndex] = updatedItem;
    } else {
      mergedCart.push(serverItem); // Add the server item if it's not already in the local cart
    }
  });

  return mergedCart;
};

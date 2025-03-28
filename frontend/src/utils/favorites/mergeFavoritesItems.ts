import { OrderItemsProps } from "../../../type";

export  const mergeFavoritesItems = (
  localFavorites: OrderItemsProps[],
  serverFavorites: OrderItemsProps[]
) => {
  const mergedFavorites: OrderItemsProps[] = [...localFavorites]; // Start with the local favorites

  serverFavorites.forEach((serverItem) => {
    const existingLocalItemIndex = mergedFavorites.findIndex(
      (localItem) => localItem.product._id === serverItem.product._id
    );

    if (existingLocalItemIndex !== -1) {
      // Create a *new* object with the updated quantity
      const updatedItem = {
        ...mergedFavorites[existingLocalItemIndex],
        quantity:
          mergedFavorites[existingLocalItemIndex].quantity + serverItem.quantity,
      };

      // Replace the old item in the array with the new one
      mergedFavorites[existingLocalItemIndex] = updatedItem;
    } else {
      mergedFavorites.push(serverItem); // Add the server item if it's not already in the local favorites
    }
  });

  return mergedFavorites;
};

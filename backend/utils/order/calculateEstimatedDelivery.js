/**
 * Calculate estimated delivery date based on order creation date
 * Standard delivery is 5-7 business days
 * @param {Date} orderDate - The date when the order was created
 * @param {number} businessDays - Number of business days for delivery (default: 5)
 * @returns {Date} - The estimated delivery date
 */
const calculateEstimatedDelivery = (orderDate = new Date(), businessDays = 5) => {
  const deliveryDate = new Date(orderDate);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    
    // Check if it's a weekday (Monday = 1, Sunday = 0)
    const dayOfWeek = deliveryDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      daysAdded++;
    }
  }
  
  return deliveryDate;
};

module.exports = calculateEstimatedDelivery;

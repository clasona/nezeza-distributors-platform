/**
 * Extract estimated delivery date from shipping rate information
 * This is a utility function that can be used to parse delivery information
 * from various shipping rate sources (Shippo, fallback rates, etc.)
 */

const calculateEstimatedDelivery = require('../order/calculateEstimatedDelivery');

/**
 * Extract delivery date from rate ID or rate object
 * @param {string|object} rateInfo - Either a rate ID string or a rate object with delivery info
 * @param {Date} orderDate - The order creation date (default: current date)
 * @returns {Date} - The estimated delivery date
 */
const extractDeliveryDateFromRate = (rateInfo, orderDate = new Date()) => {
  // If rateInfo is an object with deliveryTime or estimatedDays
  if (typeof rateInfo === 'object' && rateInfo !== null) {
    // If deliveryTime is a date string, parse it
    if (rateInfo.deliveryTime) {
      try {
        const deliveryDate = new Date(rateInfo.deliveryTime);
        if (!isNaN(deliveryDate.getTime())) {
          return deliveryDate;
        }
      } catch (error) {
        console.warn('Failed to parse deliveryTime:', rateInfo.deliveryTime);
      }
    }
    
    // If estimatedDays is provided, calculate from order date
    if (rateInfo.estimatedDays && typeof rateInfo.estimatedDays === 'number') {
      return calculateEstimatedDelivery(orderDate, rateInfo.estimatedDays);
    }
    
    // If durationTerms is provided, try to extract days from it
    if (rateInfo.durationTerms) {
      const days = extractDaysFromDurationTerms(rateInfo.durationTerms);
      if (days) {
        return calculateEstimatedDelivery(orderDate, days);
      }
    }
  }
  
  // If rateInfo is a string (rate ID), try to extract info from the pattern
  if (typeof rateInfo === 'string') {
    return extractDeliveryDateFromRateId(rateInfo, orderDate);
  }
  
  // Default fallback: 5 business days
  return calculateEstimatedDelivery(orderDate, 5);
};

/**
 * Extract delivery date from rate ID string
 * @param {string} rateId - The shipping rate ID
 * @param {Date} orderDate - The order creation date
 * @returns {Date} - The estimated delivery date
 */
const extractDeliveryDateFromRateId = (rateId, orderDate) => {
  // Handle fallback rate patterns
  if (rateId.startsWith('fallback_')) {
    let estimatedDays = 5; // default
    
    if (rateId.includes('fast') || rateId.includes('express')) {
      estimatedDays = 2;
    } else if (rateId.includes('standard')) {
      estimatedDays = 5;
    } else if (rateId.includes('economy')) {
      estimatedDays = 7;
    }
    
    return calculateEstimatedDelivery(orderDate, estimatedDays);
  }
  
  // Handle Uber same-day delivery
  if (rateId.startsWith('uber_')) {
    // Same day delivery - add 4-6 hours to current time
    const deliveryDate = new Date(orderDate);
    deliveryDate.setHours(deliveryDate.getHours() + 5); // 5 hours average
    return deliveryDate;
  }
  
  // For actual Shippo rates or unknown patterns, default to 5 days
  // TODO: In a future enhancement, we could fetch the rate details from Shippo API
  return calculateEstimatedDelivery(orderDate, 5);
};

/**
 * Extract number of days from duration terms string
 * @param {string} durationTerms - String like "2-3 business days" or "5-7 days"
 * @returns {number|null} - Number of days or null if couldn't parse
 */
const extractDaysFromDurationTerms = (durationTerms) => {
  if (!durationTerms || typeof durationTerms !== 'string') {
    return null;
  }
  
  // Try to find patterns like "2-3 days", "5 days", etc.
  const patterns = [
    /(\d+)-(\d+)\s+(?:business\s+)?days?/i,  // "2-3 business days"
    /(\d+)\s+(?:business\s+)?days?/i,        // "5 business days"
    /(\d+)-(\d+)\s+(?:business\s+)?day/i,    // "2-3 business day"
    /(\d+)\s+(?:business\s+)?day/i           // "5 business day"
  ];
  
  for (const pattern of patterns) {
    const match = durationTerms.match(pattern);
    if (match) {
      if (match[2]) {
        // Range like "2-3 days" - use the higher number
        return parseInt(match[2], 10);
      } else {
        // Single number like "5 days"
        return parseInt(match[1], 10);
      }
    }
  }
  
  return null;
};

/**
 * Get the earliest delivery date from multiple shipping options
 * @param {object} selectedShippingOptions - Object mapping seller IDs to rate info
 * @param {Date} orderDate - The order creation date
 * @returns {Date} - The earliest estimated delivery date
 */
const getEarliestDeliveryDate = (selectedShippingOptions, orderDate = new Date()) => {
  if (!selectedShippingOptions || Object.keys(selectedShippingOptions).length === 0) {
    return calculateEstimatedDelivery(orderDate, 5);
  }
  
  let earliestDate = null;
  
  for (const sellerId in selectedShippingOptions) {
    const rateInfo = selectedShippingOptions[sellerId];
    const deliveryDate = extractDeliveryDateFromRate(rateInfo, orderDate);
    
    if (!earliestDate || deliveryDate < earliestDate) {
      earliestDate = deliveryDate;
    }
  }
  
  return earliestDate || calculateEstimatedDelivery(orderDate, 5);
};

module.exports = {
  extractDeliveryDateFromRate,
  extractDeliveryDateFromRateId,
  extractDaysFromDurationTerms,
  getEarliestDeliveryDate
};
